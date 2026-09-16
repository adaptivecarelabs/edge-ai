from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Edge-AI LGA Server"
    app_version: str = "0.1.0"

    couchdb_url: str = "http://couchdb:5984"
    redis_url: str = "redis://redis:6379/0"

    class Config:
        env_file = ".env"


settings = Settings()
