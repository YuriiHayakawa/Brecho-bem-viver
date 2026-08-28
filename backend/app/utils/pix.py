"""
Gerador de payload PIX no padrão EMV QR Code (BR Code).
Gera QR Code em base64 para uso direto no frontend.
"""

import base64
import io
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


def _format_pix_key(pix_key: str, pix_key_type: str) -> str:
    if pix_key_type == "telefone":
        digits = "".join(filter(str.isdigit, pix_key))

        if not digits.startswith("55"):
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