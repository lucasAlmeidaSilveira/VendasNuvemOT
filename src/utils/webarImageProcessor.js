// Processamento das imagens AR 3D no browser, antes do upload para /webar/upload.
// Espelha imgs-ar/src/folderScan.js (createImageProcessor) para que o resultado
// seja idêntico ao gerado pelo painel de cadastro unitário de imagens.

const MAX_DIMENSION = 1024
const JPEG_QUALITY = 0.85

const WHITE_MIN = 245 // canal mais escuro precisa estar acima disso
const WHITE_SPREAD = 12 // e os canais precisam estar próximos entre si (sem dominante)
const WHITE_RATIO = 0.99 // fração da coluna que precisa ser branca
const PROBE_WIDTH = 512 // largura da cópia usada só para detectar as bordas
const ROW_STRIDE = 2 // amostra uma linha sim, uma não

/**
 * Cria um processador que reaproveita os mesmos dois canvas em várias imagens.
 * Um canvas por imagem estoura o teto de contextos do Chrome em lotes grandes.
 */
export const createWebarImageProcessor = () => {
  const probe = document.createElement('canvas')
  const probeCtx = probe.getContext('2d', { willReadFrequently: true })
  const output = document.createElement('canvas')
  const outputCtx = output.getContext('2d')

  // Detecta as colunas quase-brancas numa cópia reduzida: getImageData numa arte
  // 6000x4000 alocaria ~96 MB por imagem e derrubaria a aba no meio do lote.
  const findContentBounds = (bitmap) => {
    const scale = Math.min(1, PROBE_WIDTH / bitmap.width)
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    probe.width = width // atribuir width já limpa o canvas
    probe.height = height
    probeCtx.fillStyle = '#fff'
    probeCtx.fillRect(0, 0, width, height)
    probeCtx.drawImage(bitmap, 0, 0, width, height)

    const { data } = probeCtx.getImageData(0, 0, width, height)

    const columnIsWhite = (x) => {
      let white = 0
      let total = 0
      for (let y = 0; y < height; y += ROW_STRIDE) {
        const i = (y * width + x) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const min = Math.min(r, g, b)
        const max = Math.max(r, g, b)
        if (min >= WHITE_MIN && max - min <= WHITE_SPREAD) white++
        total++
      }
      return total > 0 && white / total >= WHITE_RATIO
    }

    let left = 0
    while (left < width && columnIsWhite(left)) left++
    let right = width - 1
    while (right > left && columnIsWhite(right)) right--

    // Guardas de sanidade: imagem quase toda branca, ou sem borda alguma para tirar.
    const kept = (right - left + 1) / width
    if (kept < 0.1 || kept > 0.995) {
      return { sx: 0, sw: bitmap.width }
    }

    return {
      sx: Math.round(left / scale),
      sw: Math.round((right - left + 1) / scale),
    }
  }

  /**
   * Recorta (opcional), reduz para MAX_DIMENSION e devolve um Blob JPEG.
   * @param {File} file
   * @param {{ trim: boolean }} options
   */
  const process = async (file, { trim }) => {
    // imageOrientation: sem isso o Chrome ignora o EXIF e fotos em retrato saem deitadas.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })

    try {
      const { sx, sw } = trim ? findContentBounds(bitmap) : { sx: 0, sw: bitmap.width }
      const sh = bitmap.height

      const scale = Math.min(1, MAX_DIMENSION / Math.max(sw, sh))
      const width = Math.max(1, Math.round(sw * scale))
      const height = Math.max(1, Math.round(sh * scale))

      output.width = width
      output.height = height
      outputCtx.imageSmoothingEnabled = true
      outputCtx.imageSmoothingQuality = 'high'
      // toBlob("image/jpeg") compõe transparência sobre PRETO: sem este fundo, um
      // PNG com alpha viraria imagem com tarjas pretas.
      outputCtx.fillStyle = '#fff'
      outputCtx.fillRect(0, 0, width, height)
      outputCtx.drawImage(bitmap, sx, 0, sw, sh, 0, 0, width, height)

      const blob = await new Promise((resolve) =>
        output.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
      )
      // toBlob pode devolver null sem lançar erro.
      if (!blob) throw new Error('Falha ao converter a imagem para JPEG')

      return blob
    } finally {
      // ImageBitmap segura memória fora do heap JS; sem close() o GC não é pressionado.
      bitmap.close()
    }
  }

  return { process }
}

export { MAX_DIMENSION, JPEG_QUALITY }
