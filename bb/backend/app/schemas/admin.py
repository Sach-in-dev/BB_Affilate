from pydantic import BaseModel, EmailStr


class RoleResponse(BaseModel):
    name: str
    label: str
    description: str | None = None
    permissions: list[str] = []
    is_system: bool = False

    class Config:
        from_attributes = True


class PermissionResponse(BaseModel):
    key: str
    label: str
    group: str


class AdminUserResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    user_type: str
    role_name: str | None = None
    permissions: list[str] = []
    is_active: bool = True

    class Config:
        from_attributes = True


class CreateAdminUserRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: str | None = None
    role_name: str
    permissions: list[str] | None = None  # override; defaults to role permissions


class UpdateAdminUserRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    role_name: str | None = None
    permissions: list[str] | None = None
    is_active: bool | None = None
    password: str | None = None
