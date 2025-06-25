"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { Instrumento, ProductImage } from "../types/Instrumento"
import { imageService } from "../services/api"
import "./InstrumentoCard.css"

interface InstrumentoCardProps {
  instrumento: Instrumento
}

export const InstrumentoCard = ({ instrumento }: InstrumentoCardProps) => {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)
  const [primaryImage, setPrimaryImage] = useState<ProductImage | null>(null)
  const [loadingImage, setLoadingImage] = useState(true)

  useEffect(() => {
    loadPrimaryImage()
  }, [instrumento.id])

  const loadPrimaryImage = async () => {
    try {
      setLoadingImage(true)
      const response = await imageService.getPrimary(instrumento.id)
      if (response.success && response.data) {
        setPrimaryImage(response.data)
      }
    } catch (error) {
      console.log(`No se encontró imagen principal para instrumento ${instrumento.id}`)
    } finally {
      setLoadingImage(false)
    }
  }

  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString("es-AR")}`
  }

  const formatearEnvio = (costoEnvio: string) => {
    if (costoEnvio === "G") {
      return (
        <div className="envio-gratis">
          <img src="/icons/truck.svg" alt="Envío gratis" className="camion-icon" />
          <span>Envío gratis a todo el país</span>
        </div>
      )
    }
    if (costoEnvio === "P") {
      return <span className="envio-pago">Envío con costo</span>
    }
    return <span className="envio-pago">Envío: ${costoEnvio}</span>
  }

  const getImageSrc = () => {
    if (imageError || loadingImage) {
      return "/icons/no-image.svg"
    }

    // Prioridad 1: Imagen principal del nuevo sistema
    if (primaryImage && primaryImage.imageUrl) {
      return imageService.getImageUrl(primaryImage.imageUrl)
    }

    // Prioridad 2: Campo imagen legacy (si existe)
    if (instrumento.imagen && instrumento.imagen.trim() !== "") {
      return imageService.getImageUrl(instrumento.imagen)
    }

    return "/icons/no-image.svg"
  }

  const handleCardClick = () => {
    navigate(`/instrumento/${instrumento.id}`)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/instrumento/${instrumento.id}`)
  }

  const handleImageError = () => {
    console.log(`Error cargando imagen para instrumento ${instrumento.id}`)
    setImageError(true)
  }

  return (
    <div className="instrumento-card" onClick={handleCardClick}>
      <div className="imagen-container">
        <img
          src={getImageSrc() || "/placeholder.svg"}
          alt={primaryImage?.altText || instrumento.instrumento}
          className="instrumento-imagen"
          onError={handleImageError}
        />
      </div>

      <div className="instrumento-info">
        <h3 className="instrumento-titulo">{instrumento.instrumento}</h3>

        <div className="precio-container">
          <span className="precio">{formatearPrecio(instrumento.precio)}</span>
        </div>

        <div className="envio-container">{formatearEnvio(instrumento.costoEnvio)}</div>

        <div className="vendidos-container">
          <span className="vendidos">{instrumento.cantidadVendida} vendidos</span>
        </div>

        <button className="btn-detalle" onClick={handleButtonClick}>
          Ver Detalle
        </button>
      </div>
    </div>
  )
}
