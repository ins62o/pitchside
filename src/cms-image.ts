export async function prepareImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('JPG, PNG, WebP 사진을 선택해주세요.')
  if (file.size > 10 * 1024 * 1024) throw new Error('사진 한 장은 10MB 이내로 선택해주세요.')
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error('사진을 읽을 수 없습니다. 다른 파일을 선택해주세요.') })
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('사진을 처리할 수 없습니다.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/webp', 0.86)
  } finally { bitmap.close() }
}
