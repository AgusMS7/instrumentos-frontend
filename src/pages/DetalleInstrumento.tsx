"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { Instrumento, Categoria, ProductImage } from "../types/Instrumento"
import { instrumentoService, categoriaService, imageService } from "../services/api"
import "./DetalleInstrumento.css"

export const DetalleInstrumento: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [instrumento, setInstrumento] = useState<Instrumento | null>(null)
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [primaryImage, setPrimaryImage] = useState<ProductImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (id) {
      fetchInstrumento(Number(id))
    }
  }, [id])

  const fetchInstrumento = async (instrumentoId: number) => {
    try {
      setLoading(true)
      const response = await instrumentoService.getById(instrumentoId)
      console.log("Respuesta instrumento:", response)

      if (response.success && response.data) {
        const instrumentoData = response.data
        setInstrumento(instrumentoData)

        // Cargar categoría si existe
        if (instrumentoData.idCategoria) {
          await fetchCategoria(instrumentoData.idCategoria)
        }

        // Cargar imágenes
        await fetchImages(instrumentoId)
      } else {
        setError("Instrumento no encontrado")
      }
    } catch (error) {
      console.error("Error conectando al backend:", error)
      setError("Error al cargar el instrumento. Verifica que el backend esté funcionando.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoria = async (categoriaId: number) => {
    try {
      const response = await categoriaService.getById(categoriaId)
      if (response.success && response.data) {
        setCategoria(response.data)
      }
    } catch (error) {
      console.error("Error al cargar categoría:", error)
    }
  }

  const fetchImages = async (instrumentoId: number) => {
    try {
      // Obtener todas las imágenes
      const imagesResponse = await imageService.getByInstrumento(instrumentoId)
      if (imagesResponse.success && imagesResponse.data) {
        setImages(imagesResponse.data)
      }

      // Obtener imagen principal
      try {
        const primaryResponse = await imageService.getPrimary(instrumentoId)
        if (primaryResponse.success && primaryResponse.data) {
          setPrimaryImage(primaryResponse.data)
        }
      } catch (error) {
        console.log("No hay imagen principal para este instrumento")
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error)
    }
  }

  const getImageUrl = (): string => {
    if (!instrumento) return "/icons/no-image.svg"

    if (imageError) {
      return "/icons/no-image.svg"
    }

    // Prioridad 1: Imagen principal del nuevo sistema
    if (primaryImage && primaryImage.imageUrl) {
      return imageService.getImageUrl(primaryImage.imageUrl)
    }

    // Prioridad 2: Primera imagen disponible
    if (images.length > 0) {
      return imageService.getImageUrl(images[0].imageUrl)
    }

    // Prioridad 3: Campo imagen legacy
    if (instrumento.imagen && instrumento.imagen.trim() !== "") {
      return imageService.getImageUrl(instrumento.imagen)
    }

    return "/icons/no-image.svg"
  }

  const handleImageError = () => {
    console.log(`Error cargando imagen en detalle: ${instrumento?.id}`)
    setImageError(true)
  }

  if (loading) {
    return (
      <div className="detalle-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando instrumento...</p>
        </div>
      </div>
    )
  }

  if (error || !instrumento) {
    return (
      <div className="detalle-container">
        <div className="detalle-content">
          <div className="error-container">
            <h2>⚠️ Error</h2>
            <p>{error || "Instrumento no encontrado"}</p>
            <button onClick={() => navigate("/productos")} className="btn btn-primary">
              ← Volver a Productos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="detalle-container">
      <div className="detalle-content">
        <div className="detalle-header">
          <button onClick={() => navigate("/productos")} className="volver-link">
            Volver a Productos
          </button>
          <h1 className="detalle-titulo">{instrumento.instrumento}</h1>
        </div>

        <div className="detalle-grid">
          <div className="detalle-imagen-container">
            <img
              src={getImageUrl() || "/placeholder.svg"}
              alt={primaryImage?.altText || instrumento.instrumento}
              className="detalle-imagen"
              onError={handleImageError}
            />
          </div>

          <div className="detalle-info">
            <div className="detalle-precio-container">
              <div className="detalle-precio">${instrumento.precio?.toLocaleString()}</div>
            </div>

            <div className="detalle-envio-container">
              {instrumento.costoEnvio === "G" ? (
                <div className="envio-gratis-detalle">
                  <img src="/icons/truck.svg" alt="Envío gratis" className="camion-icon-detalle" />
                  <span>Envío gratis a todo el país</span>
                </div>
              ) : (
                <div className="envio-pago-detalle">
                  Envío: {instrumento.costoEnvio === "P" ? "Con costo" : `$${instrumento.costoEnvio}`}
                </div>
              )}
            </div>

            <div className="detalle-vendidos-container">
              <span>{instrumento.cantidadVendida || 0} vendidos</span>
            </div>

            <div className="detalle-specs">
              <h4>Especificaciones</h4>
              <div className="spec-item">
                <span className="spec-label">Marca:</span>
                <span className="spec-value">{instrumento.marca}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Modelo:</span>
                <span className="spec-value">{instrumento.modelo}</span>
              </div>
              {categoria && (
                <div className="spec-item">
                  <span className="spec-label">Categoría:</span>
                  <span className="spec-value">{categoria.denominacion}</span>
                </div>
              )}
            </div>

            {instrumento.descripcion && (
              <div className="detalle-descripcion">
                <h3>Descripción</h3>
                <p>{instrumento.descripcion}</p>
              </div>
            )}

            <div className="detalle-actions">
              <button className="btn-comprar">🛒 Agregar al Carrito</button>
              <button className="btn-favorito">❤️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetalleInstrumento
