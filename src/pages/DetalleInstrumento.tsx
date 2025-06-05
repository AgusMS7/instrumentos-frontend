"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import type { Instrumento } from "../types/Instrumento"
import "./DetalleInstrumento.css"

export const DetalleInstrumento = () => {
  const { id } = useParams<{ id: string }>()
  const [instrumento, setInstrumento] = useState<Instrumento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstrumento = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/instrumentos/${id}`)
        if (!response.ok) {
          throw new Error("Error al cargar el instrumento")
        }
        const data = await response.json()
        setInstrumento(data)
      } catch (error) {
        console.error("Error:", error)
        setError("No se pudo cargar la información del instrumento")

        // Fallback a datos locales en caso de error
        try {
          const localData = await import("../data/instrumentos.json")
          const foundInstrumento = localData.instrumentos.find((item: Instrumento) => item.id === id)
          if (foundInstrumento) {
            setInstrumento(foundInstrumento)
            setError(null)
          }
        } catch (localError) {
          console.error("Error al cargar datos locales:", localError)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchInstrumento()
  }, [id])

  const formatearPrecio = (precio: string) => {
    return `$${Number.parseInt(precio).toLocaleString("es-AR")}`
  }

  const formatearEnvio = (costoEnvio: string) => {
    if (costoEnvio === "G") {
      return (
        <div className="envio-gratis-detalle">
          <img src="/img/camion.png" alt="Envío gratis" className="camion-icon-detalle" />
          <span>Envío gratis a todo el país</span>
        </div>
      )
    }
    return <span className="envio-pago-detalle">Costo de envío: ${costoEnvio}</span>
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando información del instrumento...</p>
      </div>
    )
  }

  if (error || !instrumento) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || "No se encontró el instrumento"}</p>
        <Link to="/productos" className="btn btn-primary">
          Volver a Productos
        </Link>
      </div>
    )
  }

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
            <img src={`/img/${instrumento.imagen}`} alt={instrumento.instrumento} className="detalle-imagen" />
          </div>

          <div className="detalle-info">
            <div className="detalle-precio-container">
              <span className="detalle-precio">{formatearPrecio(instrumento.precio)}</span>
            </div>

            <div className="detalle-envio-container">{formatearEnvio(instrumento.costoEnvio)}</div>

            <div className="detalle-vendidos-container">
              <span className="detalle-vendidos">{instrumento.cantidadVendida} vendidos</span>
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
