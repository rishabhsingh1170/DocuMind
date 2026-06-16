from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

try:
	from backend.models.common import ObjectIdStr
except ModuleNotFoundError:
	from models.common import ObjectIdStr

class DocumentBase(BaseModel):
	document_name: str
	company_id: ObjectIdStr
	uploaded_by: ObjectIdStr
	document_url: Optional[str] = None


class DocumentCreate(DocumentBase):
	pass


class DocumentInDB(DocumentBase):
	id: ObjectIdStr = Field(alias="_id")

	model_config = ConfigDict(populate_by_name=True)


class DocumentResponse(DocumentInDB):
	pass
