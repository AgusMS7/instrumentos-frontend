export interface ProductImage {
  id: number
  instrumentoId: number
  imageUrl: string
  altText: string | null
  isPrimary: boolean
  createdAt: string
}

export interface Categoria {
  id: number
  denominacion: string
}

export interface Instrumento {
  id: number
  instrumento: string
  marca: string
  modelo: string
  precio: number
  costoEnvio: string
  cantidadVendida: number
  descripcion: string
  idCategoria: number
  categoriaDenominacion?: string
  categoria?: Categoria
  // Campo imagen legacy (puede seguir existiendo)
  imagen?: string | null
  // Nuevas propiedades para el sistema de imágenes
  images?: ProductImage[]
  primaryImage?: ProductImage | null
}

// Tipos para las respuestas de la API
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
