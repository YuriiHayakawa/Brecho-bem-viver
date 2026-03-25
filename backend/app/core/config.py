from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações principais da aplicação.

    Os valores são carregados de variáveis de ambiente ou do arquivo `.env`.
    """

    APP_NAME: str = "Bazar Sebrae API"
    APP_ENV: str = "development"
    APP_PORT: int = 8000

    DATABASE_HOST: str = "localhost"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "bazar_sebrae"
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "postgres"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()
