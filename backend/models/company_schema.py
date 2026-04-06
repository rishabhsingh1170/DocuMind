from pydantic import BaseModel, ConfigDict, Field

try:
	from backend.models.common import ObjectIdStr
except ModuleNotFoundError:
	from models.common import ObjectIdStr

class CompanyBase(BaseModel):
	company_name: str
	created_by: ObjectIdStr


class CompanyCreate(CompanyBase):
	pass


class CompanyInDB(CompanyBase):
	id: ObjectIdStr = Field(alias="_id")

	model_config = ConfigDict(populate_by_name=True)


class CompanyResponse(CompanyInDB):
	pass


class CompanySchema(CompanyCreate):
	pass
