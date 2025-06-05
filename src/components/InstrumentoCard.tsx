import type { Instrumento } from "../types/Instrumento"
import "./InstrumentoCard.css"

interface InstrumentoCardProps {
  instrumento: Instrumento
}

export const InstrumentoCard = ({ instrumento }: InstrumentoCardProps) => {
  const formatearPrecio = (precio: string) => {
    return `$${precio}`
  }

  const formatearEnvio = (costoEnvio: string) => {
    if (costoEnvio === "G") {
      return (
        <div className="envio-gratis">
          <img src="/img/camion.png" alt="Envío gratis" className="camion-icon" />
          <span>Envío gratis a todo el país</span>
        </div>
      )
    }
    return <span className="envio-pago">Envío: ${costoEnvio}</span>
  }

  return (
    <div className="instrumento-card">
      <div className="imagen-container">
        <img src={`/img/${instrumento.imagen}`} alt={instrumento.instrumento} className="instrumento-imagen" />
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
      </div>
    </div>
  )
}
