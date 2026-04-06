"""
Chroma-backed RAG service for tenant-scoped PDF retrieval.
"""

from __future__ import annotations

import re
from io import BytesIO
from pathlib import Path
from typing import Any

import chromadb
from fastapi import HTTPException
from pypdf import PdfReader

try:
    from backend.config import CHROMA_COLLECTION_NAME, CHROMA_DB_PATH, RAG_MAX_CONTEXT_CHUNKS, RAG_SIMILARITY_THRESHOLD
    from backend.llm_services.mistral_service import FALLBACK_RESPONSE, embed_documents, embed_query, generate_grounded_answer
except ModuleNotFoundError:
    from config import CHROMA_COLLECTION_NAME, CHROMA_DB_PATH, RAG_MAX_CONTEXT_CHUNKS, RAG_SIMILARITY_THRESHOLD
    from llm_services.mistral_service import FALLBACK_RESPONSE, embed_documents, embed_query, generate_grounded_answer


PDF_ALLOWED_CONTENT_TYPES = {"application/pdf"}
PDF_ALLOWED_EXTENSIONS = {".pdf"}
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 180


def _get_chroma_path() -> str:
    configured = Path(CHROMA_DB_PATH)
    if configured.is_absolute():
        return str(configured)

    project_root = Path(__file__).resolve().parents[2]
    return str(project_root / configured)


_client = chromadb.PersistentClient(path=_get_chroma_path())
_collection = _client.get_or_create_collection(
    name=CHROMA_COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"},
)


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _is_supported_pdf(filename: str | None, content_type: str | None) -> bool:
    extension = ""
    if filename:
        dot_index = filename.rfind(".")
        if dot_index >= 0:
            extension = filename[dot_index:].lower()

    normalized_content_type = (content_type or "").lower()
    return extension in PDF_ALLOWED_EXTENSIONS or normalized_content_type in PDF_ALLOWED_CONTENT_TYPES


def extract_pdf_text(file_bytes: bytes, filename: str | None = None, content_type: str | None = None) -> str:
    if not _is_supported_pdf(filename, content_type):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for RAG indexing")

    try:
        reader = PdfReader(BytesIO(file_bytes))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid PDF file: {str(exc)}")

    pages: list[str] = []
    for page in reader.pages:
        extracted = page.extract_text() or ""
        if extracted.strip():
            pages.append(extracted)

    return _normalize_text("\n".join(pages))


def _chunk_text(text: str) -> list[str]:
    normalized = _normalize_text(text)
    if not normalized:
        return []

    chunks: list[str] = []
    start = 0
    step = max(1, CHUNK_SIZE - CHUNK_OVERLAP)

    while start < len(normalized):
        end = min(len(normalized), start + CHUNK_SIZE)
        if end < len(normalized):
            break_point = max(
                normalized.rfind(". ", start, end),
                normalized.rfind("! ", start, end),
                normalized.rfind("? ", start, end),
                normalized.rfind("; ", start, end),
            )
            if break_point > start + (CHUNK_SIZE // 2):
                end = break_point + 1

        chunk = normalized[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= len(normalized):
            break
        start = max(start + step, end - CHUNK_OVERLAP)

    return chunks


def index_document_chunks(
    *,
    document_id: str,
    company_id: str,
    document_name: str,
    uploaded_by: str,
    document_url: str | None,
    file_bytes: bytes,
    filename: str | None,
    content_type: str | None = None,
) -> int:
    extracted_text = extract_pdf_text(file_bytes, filename=filename, content_type=content_type)
    chunks = _chunk_text(extracted_text)
    if not chunks:
        raise HTTPException(status_code=400, detail="The PDF did not contain searchable text")

    embeddings = embed_documents(chunks)
    if len(embeddings) != len(chunks):
        raise HTTPException(status_code=502, detail="Embedding generation failed")

    ids = [f"{document_id}:{index}" for index in range(len(chunks))]
    metadatas = [
        {
            "document_id": document_id,
            "company_id": company_id,
            "document_name": document_name,
            "document_url": document_url or "",
            "uploaded_by": uploaded_by,
            "chunk_index": index,
        }
        for index in range(len(chunks))
    ]

    _collection.upsert(ids=ids, documents=chunks, metadatas=metadatas, embeddings=embeddings)
    return len(chunks)


def delete_document_chunks(document_id: str) -> None:
    existing = _collection.get(where={"document_id": document_id})
    ids = existing.get("ids", []) if existing else []
    if ids:
        _collection.delete(ids=ids)


def attach_document_url_to_chunks(document_id: str, document_url: str) -> None:
    existing = _collection.get(
        where={"document_id": document_id},
        include=["metadatas", "documents", "embeddings"],
    )
    ids = existing.get("ids", []) if existing else []
    metadatas = existing.get("metadatas", []) if existing else []
    documents = existing.get("documents", []) if existing else []
    embeddings = existing.get("embeddings", []) if existing else []

    if not ids:
        return

    updated_metadatas: list[dict[str, Any]] = []
    for metadata in metadatas:
        updated = dict(metadata or {})
        updated["document_url"] = document_url
        updated_metadatas.append(updated)

    _collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=updated_metadatas,
        embeddings=embeddings,
    )


def search_company_document_chunks(
    *,
    question: str,
    company_id: str,
    document_id: str,
    top_k: int = 4,
) -> list[dict[str, Any]]:
    query_embedding = embed_query(question)
    result = _collection.query(
        query_embeddings=[query_embedding],
        n_results=max(top_k * 3, top_k),
        where={
            "$and": [
                {"company_id": company_id},
                {"document_id": document_id},
            ]
        },
        include=["documents", "metadatas", "distances"],
    )

    ids = (result.get("ids") or [[]])[0]
    documents = (result.get("documents") or [[]])[0]
    metadatas = (result.get("metadatas") or [[]])[0]
    distances = (result.get("distances") or [[]])[0]

    matches: list[dict[str, Any]] = []
    for chunk_id, chunk_text, metadata, distance in zip(ids, documents, metadatas, distances):
        if not metadata:
            continue

        score = max(0.0, 1.0 - float(distance or 0.0))
        matches.append(
            {
                "chunk_id": chunk_id,
                "document_id": metadata.get("document_id", document_id),
                "company_id": metadata.get("company_id", company_id),
                "document_name": metadata.get("document_name", ""),
                "document_url": metadata.get("document_url", ""),
                "uploaded_by": metadata.get("uploaded_by", ""),
                "chunk_index": int(metadata.get("chunk_index", 0)),
                "text": chunk_text,
                "score": score,
            }
        )

    matches.sort(key=lambda item: item["score"], reverse=True)
    return matches[:top_k]


def answer_question_with_llm(question: str, matches: list[dict[str, Any]]) -> str:
    if not matches:
        return FALLBACK_RESPONSE

    if matches[0].get("score", 0.0) < RAG_SIMILARITY_THRESHOLD:
        return FALLBACK_RESPONSE

    context = matches[:RAG_MAX_CONTEXT_CHUNKS]
    return generate_grounded_answer(question, context)


def run_tenant_rag_workflow(
    *,
    question: str,
    company_id: str,
    document_id: str,
    top_k: int = 4,
) -> dict[str, Any]:
    """
    Execute the secure tenant RAG workflow.

    Steps:
    1. Convert question to embedding.
    2. Run company + document filtered top-k similarity retrieval in Chroma.
    3. Generate grounded response from retrieved chunks only.
    """
    matches = search_company_document_chunks(
        question=question,
        company_id=company_id,
        document_id=document_id,
        top_k=top_k,
    )
    answer = answer_question_with_llm(question, matches)
    return {
        "answer": answer,
        "matches": matches,
    }
