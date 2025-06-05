"use client"

import { useState, useEffect } from "react"
import { InstrumentoCard } from "../components/InstrumentoCard"
import type { Instrumento } from "../types/Instrumento"
import instrumentosData from "../data/instrumentos.json"
import "./Home.css"

export const Home = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])

  useEffect(() => {
    // Cargar los datos del JSON local
    setInstrumentos(instrumentosData.instrumentos)
  }, [])

  return (
    <div className="home-container">
      <header className="header">
        <h1>Symphoniac</h1>
        <p>Encontrá el instrumento perfecto para vos</p>
      </header>

      <main className="main-content">
        <div className="instrumentos-grid">
          {instrumentos.map((instrumento) => (
            <InstrumentoCard key={instrumento.id} instrumento={instrumento} />
          ))}
        </div>
      </main>
    </div>
  )
}
