"use client"

import { useEffect, useRef } from "react"
import "./DondeEstamos.css"

export const DondeEstamos = () => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Esta función se ejecutaría si tuviéramos acceso a la API de Google Maps
    // En este caso, simplemente mostramos un iframe con el mapa
    const loadMap = () => {
      if (mapRef.current) {
        // Aquí iría la lógica para cargar el mapa con la API de Google Maps
      }
    }

    loadMap()
  }, [])

  return (
    <div className="donde-estamos-container">
      <header className="donde-estamos-header">
        <h1>Donde Estamos</h1>
        <p>Visitanos en nuestra tienda física</p>
      </header>

      <main className="donde-estamos-content">
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3350.4482572921247!2d-68.84726492396837!3d-32.88679697339306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e091ed2dd83f7%3A0xf41c7ab7e3522157!2sAv.%20Las%20Heras%20%26%20Av.%20San%20Mart%C3%ADn%2C%20Mendoza!5e0!3m2!1ses!2sar!4v1717711000000!5m2!1ses!2sar"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Symphoniac"
          ></iframe>
        </div>

        <div className="contact-info">
          <h2>Información de Contacto</h2>

          <div className="info-item">
            <div className="info-icon">📍</div>
            <div className="info-text">
              <h3>Dirección</h3>
              <p>Av. Las Heras y Av. San Martín, Ciudad de Mendoza</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">📞</div>
            <div className="info-text">
              <h3>Teléfono</h3>
              <p>(+54) 261-123-4567</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">✉️</div>
            <div className="info-text">
              <h3>Email</h3>
              <p>contacto@symphoniac.com</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">🕒</div>
            <div className="info-text">
              <h3>Horarios</h3>
              <p>Lunes a Viernes: 9:00 - 18:00</p>
              <p>Sábados: 9:00 - 13:00</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
