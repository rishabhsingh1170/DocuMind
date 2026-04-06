"""
Document Controller
Handles all document-related business logic: create, list operations, file uploads.
"""

from datetime import datetime

from bson import ObjectId
from fastapi import HTTPException, status, UploadFile

try:
    from backend.database.mongo import documents_collection, companies_collection, users_collection
    from backend.rag_services.chroma_rag_service import (
        attach_document_url_to_chunks,
        delete_document_chunks,
        index_document_chunks,
    )
    from backend.models.document_schema import DocumentCreate, DocumentResponse
    from backend.controller.cloudinary_utils import upload_document
except ModuleNotFoundError:
    from database.mongo import documents_collection, companies_collection, users_collection
    from rag_services.chroma_rag_service import (
        attach_document_url_to_chunks,
        delete_document_chunks,
        index_document_chunks,
    )
    from models.document_schema import DocumentCreate, DocumentResponse
    from controller.cloudinary_utils import upload_document

from .utils import serialize_id


def create_document_logic(payload: DocumentCreate) -> dict:
    """
    Create a new document in database.
    Validates company and uploader user exist.
    
    Args:
        payload: Document creation data
        
    Returns:
        Created document with generated _id
        
    Raises:
        HTTPException: If company not found (404) or uploader not found (404)
    """
    # Validate company exists
    company = companies_collection.find_one({"_id": ObjectId(payload.company_id)})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    # Validate uploader exists
    uploader = users_collection.find_one({"_id": ObjectId(payload.uploaded_by)})
    if not uploader:
        raise HTTPException(status_code=404, detail="Uploader not found")

    # mode="json" converts HttpUrl/EmailStr to plain serializable values (BSON-safe).
    created = payload.model_dump(mode="json")
    result = documents_collection.insert_one(created)
    created["_id"] = str(result.inserted_id)
    return created


def list_documents_logic(company_id: str | None = None, uploaded_by: str | None = None) -> list[dict]:
    """
    Fetch all documents from database.
    
    Returns:
        List of all documents with serialized _id
    """
    query: dict = {}
    if company_id:
        query["company_id"] = company_id
    elif uploaded_by:
        query["uploaded_by"] = uploaded_by

    documents = documents_collection.find(query)
    return [serialize_id(document) for document in documents]


def get_document_by_id(document_id: str) -> dict:
    """
    Fetch single document by ObjectId.
    
    Args:
        document_id: Document ObjectId as string
        
    Returns:
        Document or raises 404
    """
    try:
        document = documents_collection.find_one({"_id": ObjectId(document_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid document ID format")
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return serialize_id(document)


def upload_document_file(
    company_id: str, 
    uploaded_by: str, 
    document_name: str,
    file: UploadFile
) -> dict:
    """
    Upload a document file to Cloudinary and create document record in database.
    
    Args:
        company_id: Company ObjectId as string
        uploaded_by: User ObjectId as string (uploader)
        document_name: Name of the document
        file: Document file from upload
        
    Returns:
        Created document with Cloudinary URL
        
    Raises:
        HTTPException: If validation fails or upload fails
    """
    document_object_id = ObjectId()
    document_id = str(document_object_id)

    # Validate company exists
    try:
        company_obj_id = ObjectId(company_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid company ID format")
        
    company = companies_collection.find_one({"_id": company_obj_id})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Validate uploader exists
    try:
        uploader_obj_id = ObjectId(uploaded_by)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid uploader ID format")
        
    uploader = users_collection.find_one({"_id": uploader_obj_id})
    if not uploader:
        raise HTTPException(status_code=404, detail="Uploader not found")

    try:
        file_bytes = file.file.read()
        file.file.seek(0)

        chunk_count = index_document_chunks(
            document_id=document_id,
            company_id=company_id,
            document_name=document_name,
            uploaded_by=uploaded_by,
            document_url="",
            file_bytes=file_bytes,
            filename=file.filename,
            content_type=file.content_type,
        )

        file.file.seek(0)
        document_url = upload_document(file)

        # Create document record in database.
        document_record = {
            "_id": document_object_id,
            "document_name": document_name,
            "company_id": company_id,
            "uploaded_by": uploaded_by,
            "document_url": document_url,
            "rag_indexed": True,
            "rag_chunk_count": chunk_count,
            "created_at": datetime.utcnow(),
        }

        result = documents_collection.insert_one(document_record)
        document_record["_id"] = str(result.inserted_id)
        attach_document_url_to_chunks(document_id, document_url)
        return document_record
    except HTTPException:
        delete_document_chunks(document_id)
        raise
    except Exception as e:
        delete_document_chunks(document_id)
        raise HTTPException(status_code=500, detail=f"Document upload failed: {str(e)}")
    finally:
        try:
            file.file.seek(0)
        except Exception:
            pass
