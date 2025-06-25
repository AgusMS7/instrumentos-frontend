export interface ProductImage {
  id: number
  filename: string
  alt_text: string | null
  image_type: "main" | "gallery" | "thumbnail"
  display_order: number
  url: string // URL completa construida por el backend
}

export interface Instrumento {
  id: string
  instrumento: string
  marca: string
  modelo: string
  precio: string
  costoenvio: string
  cantidadvendida: string
  descripcion: string
  // Mantener imagen por compatibilidad (deprecated)
  imagen?: string
  // Nueva estructura de imágenes
  images: ProductImage[]
  // Imagen principal para fácil acceso
  main_image?: ProductImage
}
