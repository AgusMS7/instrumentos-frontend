"use client"

import { useState, useEffect } from "react"
import { InstrumentoCard } from "../components/InstrumentoCard"
import type { Instrumento } from "../types/Instrumento"
import "./Productos.css"

export const Productos = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInstrumentos = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/instrumentos")
        if (!response.ok) {
          throw new Error("Error al cargar los instrumentos")
        }
        const data = await response.json()
        setInstrumentos(data)
      } catch (error) {
        console.error("Error:", error)
        // Fallback a datos locales en caso de error
        const localData = await import("../data/instrumentos.json")
        setInstrumentos(localData.instrumentos)
      } finally {
        setLoading(false)
      }
    }

    fetchInstrumentos()
  }, [])

  return (
    <div className="productos-container">
      <header className="productos-header">
        <h1>Nuestros Productos</h1>
        <p>Explora nuestra colección de instrumentos musicales de alta calidad</p>
      </header>

      <main className="productos-content">
        {loading ? (
          <div className="loading">Cargando instrumentos...</div>
        ) : (
          <div className="instrumentos-grid">
            {instrumentos.map((instrumento) => (
              <InstrumentoCard key={instrumento.id} instrumento={instrumento} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
