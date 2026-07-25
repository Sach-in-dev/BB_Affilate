from pydantic import BaseModel


class ProductResponse(BaseModel):
    id: str
    name: str
    brand: str | None = None
    category: str | None = None
    price: int | None = None
    discount_price: int | None = None
    image: str | None = None
    product_url: str
    sku: str | None = None
    status: str
    availability: bool
    tags: list[str] = []
    rating: float | None = None

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    pages: int


class FiltersResponse(BaseModel):
    brands: list[str]
    categories: list[str]


class GenerateLinkRequest(BaseModel):
    product_ids: list[str]
    title: str | None = None


class LinkItemResponse(BaseModel):
    product: ProductResponse
    clicks: int

    class Config:
        from_attributes = True


class AffiliateLinkResponse(BaseModel):
    id: str
    code: str
    link_type: str
    title: str | None = None
    url: str
    total_clicks: int
    total_orders: int
    total_commission: int
    items: list[LinkItemResponse] = []
    created_at: str | None = None

    class Config:
        from_attributes = True


class BannerResponse(BaseModel):
    id: str
    title: str
    subtitle: str | None = None
    image_url: str | None = None
    destination_url: str | None = None
    slot: str
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True


class BannerUpsertRequest(BaseModel):
    title: str
    subtitle: str | None = None
    image_url: str | None = None
    destination_url: str | None = None
    slot: str = "dashboard_top"
    sort_order: int = 0
    is_active: bool = True


class CreatorProfileResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    handle: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    instagram: str | None = None
    youtube: str | None = None
    niche: str | None = None
    city: str | None = None
    state: str | None = None

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    handle: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    instagram: str | None = None
    youtube: str | None = None
    niche: str | None = None
    city: str | None = None
    state: str | None = None
