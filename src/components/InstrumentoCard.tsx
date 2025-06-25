"use client"

import type React from "react"

import { useNavigate } from "react-router-dom"
import type { Instrumento } from "../types/Instrumento"
import "./InstrumentoCard.css"

interface InstrumentoCardProps {
  instrumento: Instrumento
}

export const InstrumentoCard = ({ instrumento }: InstrumentoCardProps) => {
  const navigate = useNavigate()

  const formatearPrecio = (precio: string) => {
    return `$${Number.parseInt(precio).toLocaleString("es-AR")}`
  }

  const formatearEnvio = (costoenvio: string) => {
    if (costoenvio === "G") {
      return (
        <div className="envio-gratis">
          <img src="/icons/truck.svg" alt="Envío gratis" className="camion-icon" />
          <span>Envío gratis a todo el país</span>
        </div>
      )
    }
    return <span className="envio-pago">Envío: ${costoenvio}</span>
  }

  // Obtener imagen principal (nueva lógica con fallback)
  const getMainImage = () => {
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

    // Sin imagen
    return {
      src: "/placeholder.svg?height=220&width=320",
      alt: `${instrumento.instrumento} - Sin imagen`,
    }
  }

  const mainImage = getMainImage()

  const handleCardClick = () => {
    navigate(`/instrumento/${instrumento.id}`)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Evita que se dispare el click de la tarjeta
    navigate(`/instrumento/${instrumento.id}`)
  }

  return (
    <div className="instrumento-card" onClick={handleCardClick}>
      <div className="imagen-container">
        <img src={mainImage.src || "/placeholder.svg"} alt={mainImage.alt} className="instrumento-imagen" />
      </div>

      <div className="instrumento-info">
        <h3 className="instrumento-titulo">{instrumento.instrumento}</h3>

        <div className="precio-container">
          <span className="precio">{formatearPrecio(instrumento.precio)}</span>
        </div>

        <div className="envio-container">{formatearEnvio(instrumento.costoenvio)}</div>

        <div className="vendidos-container">
          <span className="vendidos">{instrumento.cantidadvendida} vendidos</span>
        </div>

        <button className="btn-detalle" onClick={handleButtonClick}>
          Ver Detalle
        </button>
      </div>
    </div>
  )
}
