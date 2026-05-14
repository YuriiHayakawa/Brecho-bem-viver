from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Bazar Sebrae API"
    APP_ENV: str = "development"
    APP_PORT: int = 8000

    DATABASE_URL: str
    SECRET_KEY: str

    # Origens permitidas pelo CORS (separadas por vírgula)
    # Ex.: https://bazar-sebrae.vercel.app,https://meu-dominio.com
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
