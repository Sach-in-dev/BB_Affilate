from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "BeautyBarn Affiliate Platform"
    SECRET_KEY: str = "change-this-to-a-secure-random-string-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Affiliate platform's own database (read/write).
    DATABASE_URL: str = "postgresql+asyncpg://postgres@localhost:5432/bb_affiliate"

    # BeautyBarn production database — READ ONLY. Used only to source the product master.
    PROD_DB_URL: str | None = None

    # Where BeautyBarn product pages live (customers are redirected here).
    STOREFRONT_BASE_URL: str = "https://beautybarn.in"
    # Product images are stored as relative asset keys ("assets/2026/3/xyz");
    # this CDN serves them.
    ASSET_CDN_BASE_URL: str = "https://bb-asset.blr1.cdn.digitaloceanspaces.com"
    # Path template for a product detail page; {handle} is substituted.
    # Verified against the live product sitemap: /product/<handle> (singular).
    STOREFRONT_PRODUCT_PATH: str = "/product/{handle}"

    # Public base for generated affiliate links.
    AFFILIATE_BASE_URL: str = "http://localhost:5173"

    # Safety cap: never pull more than this many products from production.
    PRODUCT_SYNC_LIMIT: int = 20

    # Comma-separated list of allowed CORS origins.
    CORS_ORIGINS: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
