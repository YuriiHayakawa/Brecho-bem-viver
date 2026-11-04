// Larguras (px) por contexto de exibição — já considerando telas de alta densidade (2x)
export const IMG_SIZE = {
  thumb:  200,   // miniaturas e cards pequenos (60–120px na tela)
  card:   600,   // cards do catálogo
  detail: 1000,  // foto principal da página do produto
  full:   1600,  // lightbox (tela cheia)
};

// Pede ao Cloudinary uma versão redimensionada e comprimida da foto, em vez do
// arquivo original enviado pelo celular (que costuma ter vários MB).
// f_auto = melhor formato aceito pelo navegador (WebP/AVIF), q_auto = compressão
// automática, c_limit = só reduz, nunca aumenta. URLs que não são do Cloudinary
// (ou que já têm transformação) voltam sem alteração.
export function optimizedImage(url, width) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  if (/\/image\/upload\/[^/]*(w_|f_auto|q_auto)/.test(url)) return url;
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

// ── Redução antes do upload ─────────────────────────────
const MAX_UPLOAD_SIDE  = IMG_SIZE.full;      // maior tamanho exibido no site
const SKIP_BELOW_BYTES = 1.5 * 1024 * 1024;  // foto já pequena: envia como está

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Formato não suportado')); };
    img.src = url;
  });
}

// Reduz a foto no navegador (lado maior até 1600px, JPEG) antes de enviar —
// fotos de celular têm vários MB, o que deixa o upload lento e pode passar do
// limite de 10 MB do Cloudinary. Em qualquer falha (ex.: HEIC em navegador que
// não abre esse formato) devolve o arquivo original, sem bloquear o envio.
export async function compressImage(file, maxSide = MAX_UPLOAD_SIDE, quality = 0.85) {
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= SKIP_BELOW_BYTES) return file;

    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // JPEG não tem transparência: PNG transparente fica com fundo branco
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
