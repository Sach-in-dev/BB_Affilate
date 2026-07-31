from pydantic import BaseModel, EmailStr
from typing import Optional


class WaitlistSubmit(BaseModel):
    name: str
    email: EmailStr
    instagram_link: str
    platforms: Optional[str] = None
    social_links: Optional[str] = None
    additional_info: Optional[str] = None


class WaitlistResponse(BaseModel):
    id: str
    name: str
    email: str
    instagram_link: str
    platforms: Optional[str] = None
    social_links: Optional[str] = None
    additional_info: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
