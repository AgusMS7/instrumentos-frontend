"use client"

import { useState, useEffect } from "react"
import { InstrumentoCard } from "../components/InstrumentoCard"
import { ErrorScreen } from "../components/ErrorScreen"
import type { Instrumento } from "../types/Instrumento"
import "./Productos.css"

export const Productos = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const fetchInstrumentos = async () => {
    try {
      setError(null)
      const response = await fetch("http://localhost:3001/api/instrumentos")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setInstrumentos(data)
    } catch (error) {
      console.error("Error conectando al backend:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setInstrumentos([])
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    fetchInstrumentos()
  }, [])

  const handleRetry = () => {
    setIsRetrying(true)
    setLoading(true)
    fetchInstrumentos()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando instrumentos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorScreen
        title="Error al cargar productos"
        message="No se pudieron cargar los productos desde el servidor."
        details={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    )
  }

  return (
    <div className="productos-container">
      <header className="productos-header">
        <h1>Nuestros Productos</h1>
        <p>Explora nuestra colección de instrumentos musicales de alta calidad</p>
      </header>

      <main className="productos-content">
        <div className="instrumentos-grid">
          {instrumentos.map((instrumento) => (
            <InstrumentoCard key={instrumento.id} instrumento={instrumento} />
          ))}
        </div>
      </main>
    </div>
  )
}
