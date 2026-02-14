export const validatePhotoUrl = async (url: string): Promise<boolean> => {
  if (!url.trim()) return true
  try {
    new URL(url)
  } catch {
    return false
  }
  const img = new Image()
  return new Promise((resolve) => {
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}