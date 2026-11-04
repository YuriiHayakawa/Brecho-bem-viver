"""
Gerador de payload PIX no padrão EMV QR Code (BR Code).
Gera QR Code em base64 para uso direto no frontend.
"""

import base64
import io
import re
import unicodedata

import qrcode
from qrcode.image.pil import PilImage


PIX_KEY_TYPE_LABELS = {
    "cpf": "CPF",
    "telefone": "Telefone",
    "email": "E-mail",
    "aleatoria": "Chave Aleatória",
}


def _remove_accents(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def _tlv(field_id: str, value: str) -> str:
    return f"{field_id}{len(value):02d}{value}"


def _crc16(payload: str) -> str:
    crc = 0xFFFF

    for char in payload:
        crc ^= ord(char) << 8

        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if (crc & 0x8000) else (crc << 1)
            crc &= 0xFFFF

    return format(crc, "04X")


_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_EVP_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


def _only_digits(value: str) -> str:
    return "".join(filter(str.isdigit, value))


def _is_valid_cpf(digits: str) -> bool:
    if len(digits) != 11 or digits == digits[0] * 11:
        return False

    # Dígitos verificadores: pesos 10..2 para o 1º e 11..2 para o 2º
    for n in (9, 10):
        total = sum(int(d) * w for d, w in zip(digits[:n], range(n + 1, 1, -1)))
        if (total * 10) % 11 % 10 != int(digits[n]):
            return False

    return True


def normalize_pix_key(pix_key: str, pix_key_type: str) -> str:
    """Valida e padroniza a chave PIX conforme o tipo, no formato em que é salva
    no banco. Levanta ValueError com a mensagem para o usuário quando a chave é
    inválida — uma chave errada gera um QR Code em que o comprador não consegue pagar."""
    if pix_key_type not in PIX_KEY_TYPE_LABELS:
        raise ValueError("Tipo de chave PIX inválido")

    key = (pix_key or "").strip()

    if pix_key_type == "cpf":
        digits = _only_digits(key)
        if not _is_valid_cpf(digits):
            raise ValueError("Chave PIX inválida: confira os 11 dígitos do CPF")
        return digits

    if pix_key_type == "telefone":
        digits = _only_digits(key)
        # Aceita o número digitado com o código do país (+55 61 99999-9999)
        if len(digits) in (12, 13) and digits.startswith("55"):
            digits = digits[2:]
        if len(digits) not in (10, 11):
            raise ValueError("Chave PIX inválida: informe o telefone com DDD")
        return digits

    if pix_key_type == "email":
        key = key.lower()
        if len(key) > 77 or not _EMAIL_RE.match(key):
            raise ValueError("Chave PIX inválida: informe um e-mail válido")
        return key

    # aleatoria — aceita colada sem hífens e completa no formato padrão
    key = key.lower()
    if re.fullmatch(r"[0-9a-f]{32}", key):
        key = f"{key[:8]}-{key[8:12]}-{key[12:16]}-{key[16:20]}-{key[20:]}"
    if not _EVP_RE.match(key):
        raise ValueError(
            "Chave PIX inválida: a chave aleatória tem 32 letras e números separados por hífens "
            "(ex.: 123e4567-e89b-12d3-a456-426614174000)"
        )
    return key


def _format_pix_key(pix_key: str, pix_key_type: str) -> str:
    if pix_key_type == "telefone":
        digits = _only_digits(pix_key)

        # Número nacional (DDD + número) sempre recebe o código do país. Não dá
        # para decidir olhando se começa com "55": esse também é o DDD de parte do RS.
        if len(digits) in (10, 11):
            digits = "55" + digits

        return "+" + digits

    return pix_key.strip()


def generate_pix_payload(
    pix_key: str,
    pix_key_type: str,
    seller_name: str,
    city: str = "SAO PAULO",
    description: str = "Bazar Interno",
) -> str:
    key = _format_pix_key(pix_key, pix_key_type)

    gui = _tlv("00", "BR.GOV.BCB.PIX")
    chave = _tlv("01", key)
    info = _tlv("02", description[:72])
    merchant_account = _tlv("26", gui + chave + info)

    name = _remove_accents(seller_name).upper()[:25]
    city_clean = _remove_accents(city).upper()[:15]

    additional_data = _tlv("62", _tlv("05", "***"))

    payload = (
        _tlv("00", "01")
        + merchant_account
        + _tlv("52", "0000")
        + _tlv("53", "986")
        + _tlv("58", "BR")
        + _tlv("59", name)
        + _tlv("60", city_clean)
        + additional_data
        + "6304"
    )

    return payload + _crc16(payload)


def generate_pix_qrcode_base64(
    pix_key: str,
    pix_key_type: str,
    seller_name: str,
) -> str:
    payload = generate_pix_payload(
        pix_key=pix_key,
        pix_key_type=pix_key_type,
        seller_name=seller_name,
    )

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )

    qr.add_data(payload)
    qr.make(fit=True)

    img: PilImage = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    base64_string = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{base64_string}"