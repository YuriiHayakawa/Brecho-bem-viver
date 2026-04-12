"""
Gerador de payload PIX no padrão EMV QR Code (BR Code).
Compatível com qualquer app bancário brasileiro.

Referência: Manual de Padrões para Iniciação do PIX — Banco Central do Brasil
https://www.bcb.gov.br/content/estabilidadefinanceira/forumpireunioes/AnexoI-PadroesParaIniciacaodoPix.pdf
"""

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
    """Remove acentos e caracteres especiais para conformidade com o padrão PIX."""
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def _tlv(field_id: str, value: str) -> str:
    """Monta um campo TLV (Tag-Length-Value) do payload EMV."""
    return f"{field_id}{len(value):02d}{value}"


def _crc16(payload: str) -> str:
    """Calcula o CRC-16/CCITT-FALSE do payload PIX."""
    crc = 0xFFFF
    for char in payload:
        crc ^= ord(char) << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) if (crc & 0x8000) else (crc << 1)
            crc &= 0xFFFF
    return format(crc, "04X")


def _format_pix_key(pix_key: str, pix_key_type: str) -> str:
    """Formata a chave PIX conforme o tipo."""
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
    description: str = "Bazar Sebrae",
) -> str:
    """
    Gera o payload EMV do QR Code PIX estático com valor fixo.

    Args:
        pix_key: A chave PIX do vendedor
        pix_key_type: Tipo da chave ('cpf', 'telefone', 'email', 'aleatoria')
        seller_name: Nome do vendedor (máx. 25 caracteres no padrão)
        amount: Valor da transação em reais
        city: Cidade do vendedor (máx. 15 caracteres no padrão)
        description: Descrição da transação (txid)

    Returns:
        String do payload PIX pronto para virar QR Code
    """
    key = _format_pix_key(pix_key, pix_key_type)

    # Campo 26 — Merchant Account Information (PIX)
    gui = _tlv("00", "BR.GOV.BCB.PIX")
    chave = _tlv("01", key)
    info = _tlv("02", description[:72])
    merchant_account = _tlv("26", gui + chave + info)

    # Normaliza nome e cidade (sem acentos, uppercase, tamanho máximo)
    name = _remove_accents(seller_name).upper()[:25]
    city_clean = _remove_accents(city).upper()[:15]

    # Campo 62 — Additional Data Field (txid obrigatório)
    additional_data = _tlv("62", _tlv("05", "***"))

    payload = (
        _tlv("00", "01") +           # Payload Format Indicator
        merchant_account +            # Merchant Account Information
        _tlv("52", "0000") +         # Merchant Category Code (genérico)
        _tlv("53", "986") +          # Transaction Currency — BRL
        # Campo 54 (valor) omitido → pagador define o valor livremente
        _tlv("58", "BR") +           # Country Code
        _tlv("59", name) +            # Merchant Name
        _tlv("60", city_clean) +      # Merchant City
        additional_data +
        "6304"                        # CRC placeholder
    )

    return payload + _crc16(payload)


def generate_pix_qrcode_png(
    pix_key: str,
    pix_key_type: str,
    seller_name: str,
) -> bytes:
    """
    Gera o QR Code PIX sem valor fixo — o pagador define o valor livremente.

    Returns:
        bytes do arquivo PNG do QR Code
    """
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
    return buffer.getvalue()
