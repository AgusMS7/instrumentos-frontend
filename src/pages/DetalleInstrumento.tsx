"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ErrorScreen } from "../components/ErrorScreen"
import type { Instrumento } from "../types/Instrumento"
import "./DetalleInstrumento.css"

export const DetalleInstrumento = () => {
  const { id } = useParams<{ id: string }>()
  const [instrumento, setInstrumento] = useState<Instrumento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const fetchInstrumento = async () => {
    try {
      setError(null)
      const response = await fetch(`http://localhost:3001/api/instrumentos/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Instrumento no encontrado")
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setInstrumento(data)
    } catch (error) {
      console.error("Error conectando al backend:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setInstrumento(null)
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    fetchInstrumento()
  }, [id])

  const handleRetry = () => {
    setIsRetrying(true)
    setLoading(true)
    fetchInstrumento()
  }

  const formatearPrecio = (precio: string) => {
    return `$${Number.parseInt(precio).toLocaleString("es-AR")}`
  }

  const formatearEnvio = (costoenvio: string) => {
    if (costoenvio === "G") {
      return (
        <div className="envio-gratis-detalle">
          <img src="/icons/truck.svg" alt="Envío gratis" className="camion-icon-detalle" />
          <span>Envío gratis a todo el país</span>
        </div>
      )
    }
    return <span className="envio-pago-detalle">Costo de envío: ${costoenvio}</span>
  }

  // Obtener imagen principal (nueva lógica con fallback)
  const getMainImage = () => {
    if (!instrumento) return null

    // Prioridad 1: main_image de la nueva estructura
    if (instrumento.main_image) {
      return {
        src: instrumento.main_image.url,
        alt: instrumento.main_image.alt_text || instrumento.instrumento,
      }
    }

    // Prioridad 2: primera imagen de la galería
    if (instrumento.images && instrumento.images.length > 0) {
      const firstImage = instrumento.images[0]
      return {
        src: firstImage.url,
        alt: firstImage.alt_text || instrumento.instrumento,
      }
    }

    // Fallback: estructura antigua (compatibilidad)
    if (instrumento.imagen) {
      return {
        src: `http://localhost:3001/images/${instrumento.imagen}`,
        alt: instrumento.instrumento,
      }
    }

    return null
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del instrumento...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorScreen
        title="Error al cargar instrumento"
        message="No se pudo cargar la información del instrumento."
        details={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (!instrumento) {
    return (
      <ErrorScreen
        title="Instrumento no encontrado"
        message="El instrumento que buscas no existe o ha sido eliminado."
        showHomeButton={true}
        onRetry={undefined}
      />
    )
  }

  const mainImage = getMainImage()

  return (
    <div className="detalle-container">
      <div className="detalle-content">
        <div className="detalle-header">
          <Link to="/productos" className="volver-link">
            ← Volver a Productos
          </Link>
          <h1 className="detalle-titulo">{instrumento.instrumento}</h1>
        </div>

        <div className="detalle-grid">
          <div className="detalle-imagen-container">
            {mainImage ? (
              <img src={mainImage.src || "/placeholder.svg"} alt={mainImage.alt} className="detalle-imagen" />
            ) : (
              <div className="sin-imagen">
                <span>Sin imagen disponible</span>
              </div>
            )}
          </div>

          <div className="detalle-info">
            <div className="detalle-precio-container">
              <span className="detalle-precio">{formatearPrecio(instrumento.precio)}</span>
            </div>

            <div className="detalle-envio-container">{formatearEnvio(instrumento.costoenvio)}</div>

            <div className="detalle-vendidos-container">
              <span className="detalle-vendidos">{instrumento.cantidadvendida} vendidos</span>
            </div>

            <div className="detalle-specs">
              <div className="spec-item">
                <span className="spec-label">Marca:</span>
                <span className="spec-value">{instrumento.marca}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Modelo:</span>
                <span className="spec-value">{instrumento.modelo}</span>
              </div>
            </div>

            <div className="detalle-descripcion">
              <h3>Descripción</h3>
              <p>{instrumento.descripcion}</p>
            </div>

            <div className="detalle-actions">
              <button className="btn btn-primary">Comprar Ahora</button>
              <button className="btn btn-outline">Agregar al Carrito</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
