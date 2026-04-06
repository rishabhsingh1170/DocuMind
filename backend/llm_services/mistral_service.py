"""
Mistral LLM and embedding service helpers.
"""

from __future__ import annotations

from functools import lru_cache

from fastapi import HTTPException
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
from pydantic import SecretStr

try:
    from backend.config import MISTRAL_API_KEY, MISTRAL_CHAT_MODEL, MISTRAL_EMBEDDING_MODEL, RAG_MAX_OUTPUT_TOKENS
except ModuleNotFoundError:
    from config import MISTRAL_API_KEY, MISTRAL_CHAT_MODEL, MISTRAL_EMBEDDING_MODEL, RAG_MAX_OUTPUT_TOKENS


FALLBACK_RESPONSE = "I don't know based on the uploaded PDF."


def _require_mistral_key() -> SecretStr:
    if not MISTRAL_API_KEY:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY is not configured")
    return SecretStr(MISTRAL_API_KEY)


@lru_cache(maxsize=1)
def get_embeddings_model() -> MistralAIEmbeddings:
    return MistralAIEmbeddings(
        api_key=_require_mistral_key(),
        model=MISTRAL_EMBEDDING_MODEL,
    )


@lru_cache(maxsize=1)
def get_chat_model() -> ChatMistralAI:
    return ChatMistralAI(
        api_key=_require_mistral_key(),
        model_name=MISTRAL_CHAT_MODEL,
        temperature=0.0,
        max_tokens=RAG_MAX_OUTPUT_TOKENS,
    )


def embed_documents(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    return get_embeddings_model().embed_documents(texts)


def embed_query(text: str) -> list[float]:
    return get_embeddings_model().embed_query(text)


def generate_grounded_answer(question: str, context_chunks: list[dict]) -> str:
    if not context_chunks:
        return FALLBACK_RESPONSE

    context_lines: list[str] = []
    for item in context_chunks:
        context_lines.append(
            f"[Chunk {item.get('chunk_index', 0) + 1} | Score {item.get('score', 0.0):.3f}] {item.get('text', '')}"
        )

    system_prompt = (
        "You are a policy assistant. Answer strictly from the provided PDF context. "
        "Never use outside knowledge. Never infer missing facts. "
        "If the answer is not explicitly present in the context, reply exactly: "
        f'"{FALLBACK_RESPONSE}"'
    )
    user_prompt = (
        f"Question: {question}\n\n"
        f"Context:\n{chr(10).join(context_lines)}\n\n"
        "Instruction: Return only a concise, grounded answer from context."
    )

    try:
        response = get_chat_model().invoke(
            [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt),
            ]
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {str(exc)}")

    answer = (getattr(response, "content", "") or "").strip()
    if not answer:
        return FALLBACK_RESPONSE
    return answer
