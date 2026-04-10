"""
Script para inserir produtos fake no banco de dados.
Requer que já existam usuários cadastrados (rode seed_users.py antes).

Uso (a partir da pasta backend/):
    python -m app.scripts.seed_products
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database import SessionLocal, engine, Base
from app.models.product import Product
from app.models.user import User

Base.metadata.create_all(bind=engine)

PRODUTOS_FAKE = [
    {
        "name": "Camiseta Polo Listrada",
        "description": "Camiseta polo listrada em azul e branco, tecido 100% algodão, muito confortável para o dia a dia.",
        "size": "M",
        "category": "Camiseta",
        "brand": "Lacoste",
        "gender": "masculino",
        "price": 35.00,
        "has_defect": False,
    },
    {
        "name": "Vestido Floral Midi",
        "description": "Vestido midi com estampa floral colorida, tecido leve e fluido, perfeito para o verão.",
        "size": "P",
        "category": "Vestido",
        "brand": "Farm",
        "gender": "feminino",
        "price": 55.00,
        "has_defect": False,
    },
    {
        "name": "Calça Jeans Skinny",
        "description": "Calça jeans skinny azul escura, corte moderno e ajustado. Excelente estado de conservação.",
        "size": "38",
        "category": "Calça",
        "brand": "Levi's",
        "gender": "feminino",
        "price": 45.00,
        "has_defect": False,
    },
    {
        "name": "Tênis Casual Branco",
        "description": "Tênis casual todo branco, solado borracha, ideal para looks despojados.",
        "size": "42",
        "category": "Calçado",
        "brand": "Adidas",
        "gender": "masculino",
        "price": 80.00,
        "has_defect": False,
    },
    {
        "name": "Blusa de Moletom Cinza",
        "description": "Blusa de moletom cinza mesclado com capuz, quentinha e confortável.",
        "size": "G",
        "category": "Moletom",
        "brand": "Nike",
        "gender": "unissex",
        "price": 40.00,
        "has_defect": False,
    },
    {
        "name": "Saia Jeans com Barra Desfiada",
        "description": "Saia jeans midi com barra desfiada, estilo despojado e atual.",
        "size": "36",
        "category": "Saia",
        "brand": "Zara",
        "gender": "feminino",
        "price": 30.00,
        "has_defect": False,
    },
    {
        "name": "Camisa Social Xadrez",
        "description": "Camisa social slim fit com estampa xadrez em azul e branco. Pequena mancha na manga direita.",
        "size": "M",
        "category": "Camisa",
        "brand": "Aramis",
        "gender": "masculino",
        "price": 25.00,
        "has_defect": True,
        "defect_description": "Pequena mancha na parte interna da manga direita, dificilmente visível.",
    },
    {
        "name": "Jaqueta Jeans",
        "description": "Jaqueta jeans clássica com botões de metal dourado, caimento oversized.",
        "size": "G",
        "category": "Jaqueta",
        "brand": "Calvin Klein",
        "gender": "feminino",
        "price": 70.00,
        "has_defect": False,
    },
    {
        "name": "Bermuda de Linho Bege",
        "description": "Bermuda masculina de linho bege, leve e fresca, ideal para dias quentes.",
        "size": "40",
        "category": "Bermuda",
        "brand": "Reserva",
        "gender": "masculino",
        "price": 38.00,
        "has_defect": False,
    },
    {
        "name": "Body Canelado Preto",
        "description": "Body canelado preto com decote quadrado, tecido elástico com ótimo caimento.",
        "size": "P",
        "category": "Body",
        "brand": "Renner",
        "gender": "feminino",
        "price": 22.00,
        "has_defect": False,
    },
    {
        "name": "Tênis Infantil Colorido",
        "description": "Tênis infantil em cores vibrantes, muito bem conservado, utilizado poucas vezes.",
        "size": "30",
        "category": "Calçado",
        "brand": "Pampili",
        "gender": "infantil",
        "price": 28.00,
        "has_defect": False,
    },
    {
        "name": "Camiseta Básica Branca",
        "description": "Camiseta básica branca 100% algodão, corte regular, peça clássica do guarda-roupa.",
        "size": "GG",
        "category": "Camiseta",
        "brand": "Hering",
        "gender": "masculino",
        "price": 15.00,
        "has_defect": False,
    },
]


def seed_products():
    db = SessionLocal()

    try:
        # Pega o primeiro usuário disponível como dono dos produtos
        user = db.query(User).first()
        if not user:
            print("❌ Nenhum usuário encontrado. Rode seed_users.py antes.")
            return

        inseridos = 0
        ignorados = 0

        for i, dados in enumerate(PRODUTOS_FAKE):
            existe = db.query(Product).filter(Product.name == dados["name"]).first()
            if existe:
                print(f"  ⚠️  Ignorado (já existe): {dados['name']}")
                ignorados += 1
                continue

            produto = Product(
                name=dados["name"],
                description=dados["description"],
                size=dados["size"],
                category=dados["category"],
                brand=dados["brand"],
                gender=dados["gender"],
                price=dados["price"],
                has_defect=dados.get("has_defect", False),
                defect_description=dados.get("defect_description"),
                id_user=user.id,
            )

            db.add(produto)
            db.flush()  # para gerar o ID antes do commit

            produto.code = f"BZR-{produto.id:04d}"
            inseridos += 1
            print(f"  ✅ Inserido: {dados['name']} — R$ {dados['price']:.2f} ({dados['category']}, {dados['size']})")

        db.commit()
        print(f"\n📊 Resultado: {inseridos} inserido(s), {ignorados} ignorado(s).")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Iniciando seed de produtos...\n")
    seed_products()
    print("\n✔️  Seed concluído!")
