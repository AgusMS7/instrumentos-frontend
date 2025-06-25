"use client"

import { Link } from "react-router-dom"
import "./ErrorScreen.css"

interface ErrorScreenProps {
  title?: string
  message?: string
  details?: string
  onRetry?: () => void
  showHomeButton?: boolean
  isRetrying?: boolean
}

export const ErrorScreen = ({
  title = "Error de Conexión",
  message = "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.",
  details,
  onRetry,
  showHomeButton = true,
  isRetrying = false,
}: ErrorScreenProps) => {
  return (
    <div className="error-screen">
      <div className="error-icon">⚠️</div>

      <h2 className="error-title">{title}</h2>

      <p className="error-message">{message}</p>

      {details && (
        <div className="error-details">
          <strong>Detalles técnicos:</strong>
          <br />
          {details}
        </div>
      )}

      <div className="error-actions">
        {onRetry && (
          <button className="retry-button" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? (
              <>
                <span>🔄</span>
                Reintentando...
              </>
            ) : (
              <>
                <span>🔄</span>
                Reintentar
              </>
            )}
          </button>
        )}

        {showHomeButton && (
          <Link to="/" className="home-button">
            <span>🏠</span>
            Ir al Inicio
          </Link>
        )}
      </div>
    </div>
  )
}
