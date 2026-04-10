"""
Script para inserir usuários fake no banco de dados.

Uso (a partir da pasta backend/):
    python -m app.scripts.seed_users
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal, engine, Base
from app.models.user import User

# Garante que as tabelas existam
Base.metadata.create_all(bind=engine)

USUARIOS_FAKE = [
    {
        "name": "Admin Sebrae",
        "email": "admin@sebrae.com.br",
        "password_hash": "admin123",
        "phone": "11999990001",
        "role": "admin",
        "pix_key": "admin@sebrae.com.br",
        "pix_key_type": "email",
    },
    {
        "name": "Ana Paula Ferreira",
        "email": "ana.ferreira@email.com",
        "password_hash": "senha123",
        "phone": "11988880001",
        "role": "user",
        "pix_key": "11988880001",
        "pix_key_type": "telefone",
    },
    {
        "name": "Carlos Eduardo Lima",
        "email": "carlos.lima@email.com",
        "password_hash": "senha123",
        "phone": "21977770002",
        "role": "user",
        "pix_key": "12345678901",
        "pix_key_type": "cpf",
    },
    {
        "name": "Mariana Costa",
        "email": "mariana.costa@email.com",
        "password_hash": "senha123",
        "phone": "31966660003",
        "role": "user",
        "pix_key": "3b4f7a92-1c2d-4e5f-a6b7-8c9d0e1f2a3b",
        "pix_key_type": "aleatoria",
    },
    {
        "name": "Roberto Alves",
        "email": "roberto.alves@email.com",
        "password_hash": "senha123",
        "phone": "41955550004",
        "role": "user",
        "pix_key": "roberto.alves@email.com",
        "pix_key_type": "email",
    },
]


def seed_users():
    db = SessionLocal()

    try:
        inseridos = 0
        ignorados = 0

        for dados in USUARIOS_FAKE:
            existe = db.query(User).filter(User.email == dados["email"]).first()

            if existe:
                print(f"  ⚠️  Ignorado (já existe): {dados['email']}")
                ignorados += 1
                continue

            usuario = User(**dados)
            db.add(usuario)
            inseridos += 1
            print(f"  ✅ Inserido: {dados['name']} ({dados['email']}) — role: {dados['role']}")

        db.commit()
        print(f"\n📊 Resultado: {inseridos} inserido(s), {ignorados} ignorado(s).")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro ao inserir usuários: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Iniciando seed de usuários...\n")
    seed_users()
    print("\n✔️  Seed concluído!")
