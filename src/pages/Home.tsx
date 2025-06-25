"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { InstrumentoCard } from "../components/InstrumentoCard"
import { ErrorScreen } from "../components/ErrorScreen"
import type { Instrumento } from "../types/Instrumento"
import "./Home.css"

export const Home = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const navigate = useNavigate()

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

  useEffect(() => {
    if (instrumentos.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [instrumentos])

  const handleRetry = () => {
    setIsRetrying(true)
    setLoading(true)
    fetchInstrumentos()
  }

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index)
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
  }

  // Función para navegar al detalle del instrumento
  const handleInstrumentoClick = (instrumentoId: string) => {
    navigate(`/instrumento/${instrumentoId}`)
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
        title="Error al cargar instrumentos"
        message="No se pudieron cargar los instrumentos desde el servidor."
        details={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
        showHomeButton={false}
      />
    )
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
        {/* Slider mejorado */}
        {destacados.length > 0 && (
          <div className="slider-container">
            <div className="slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {destacados.map((instrumento) => (
                <div
                  key={instrumento.id}
                  className="slide"
                  onClick={() => handleInstrumentoClick(instrumento.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Fondo con blur */}
                  <div
                    className="slide-background"
                    style={{
                      backgroundImage: `url(http://localhost:3001/images/${instrumento.imagen})`,
                    }}
                  />

                  {/* Overlay para mejorar contraste */}
                  <div className="slide-overlay" />

                  {/* Imagen principal */}
                  <img
                    src={`http://localhost:3001/images/${instrumento.imagen}`}
                    alt={instrumento.instrumento}
                    className="slide-image"
                  />

                  {/* Contenido del slide */}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSlideChange(index)
                  }}
                />
              ))}
            </div>

            <div
              className="slider-arrow left"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevSlide()
              }}
            >
              &#10094;
            </div>
            <div
              className="slider-arrow right"
              onClick={(e) => {
                e.stopPropagation()
                handleNextSlide()
              }}
            >
              &#10095;
            </div>
          </div>
        )}

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

        <div className="instrumentos-grid">
          {instrumentos.slice(0, 4).map((instrumento) => (
            <InstrumentoCard key={instrumento.id} instrumento={instrumento} />
          ))}
        </div>
      </main>
    </div>
  )
}
