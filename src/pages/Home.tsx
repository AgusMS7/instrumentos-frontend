"use client"

import { useState, useEffect } from "react"
import { InstrumentoCard } from "../components/InstrumentoCard"
import type { Instrumento } from "../types/Instrumento"
import "./Home.css"

export const Home = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // En un entorno real, esto sería una llamada a la API
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index)
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
  }

  // Seleccionar 3 instrumentos destacados para el slider
  const destacados = instrumentos.slice(0, 3)

  return (
    <div className="home-container">
      <header className="header">
        <div className="header-content">
          <h1>Symphoniac</h1>
          <p>Encontrá el instrumento perfecto para vos</p>
        </div>
      </header>

      <main className="main-content">
        {/* Slider */}
        <div className="slider-container">
          <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {destacados.map((instrumento) => (
              <div key={instrumento.id} className="slide">
                <img src={`/img/${instrumento.imagen}`} alt={instrumento.instrumento} className="slide-image" />
                <div className="slide-content">
                  <h3>{instrumento.instrumento}</h3>
                  <p>
                    {instrumento.marca} - {instrumento.modelo}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="slider-controls">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`slider-dot ${currentSlide === index ? "active" : ""}`}
                onClick={() => handleSlideChange(index)}
              />
            ))}
          </div>

          <div className="slider-arrow left" onClick={handlePrevSlide}>
            &#10094;
          </div>
          <div className="slider-arrow right" onClick={handleNextSlide}>
            &#10095;
          </div>
        </div>

        {/* About section */}
        <div className="about-section">
          <h2>Sobre Nosotros</h2>
          <p>
            Symphoniac es una tienda de instrumentos musicales con más de 15 años de experiencia en el mercado. Tenemos
            el conocimiento y la capacidad como para informarte acerca de las mejores elecciones para tu compra musical.
            Ofrecemos una amplia variedad de instrumentos de las mejores marcas, con envíos a todo el país y garantía en
            todos nuestros productos.
          </p>
        </div>

        {/* Featured products */}
        <h2 className="section-title">Instrumentos Destacados</h2>

        {loading ? (
          <div className="loading">Cargando instrumentos...</div>
        ) : (
          <div className="instrumentos-grid">
            {instrumentos.slice(0, 4).map((instrumento) => (
              <InstrumentoCard key={instrumento.id} instrumento={instrumento} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
