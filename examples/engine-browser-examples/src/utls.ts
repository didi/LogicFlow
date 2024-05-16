export const getImageUrl = (name: string): string => {
  const assetPath = `/src/assets${name}`
  return new URL(assetPath, import.meta.url).href
}
