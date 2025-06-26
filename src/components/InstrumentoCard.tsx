"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Instrumento, ProductImage } from "../types/Instrumento";
import {
  loadPrimaryImageSafely,
  getImageUrl,
  handleImageError,
  getImageAltText,
} from "../utils/imageUtils";
import "./InstrumentoCard.css";

interface InstrumentoCardProps {
  instrumento: Instrumento;
}

export const InstrumentoCard = ({ instrumento }: InstrumentoCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<ProductImage | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    loadPrimaryImage();
  }, [instrumento.id]);

  const loadPrimaryImage = async () => {
    setLoadingImage(true);
    await loadPrimaryImageSafely(
      instrumento.id,
      (image) => setPrimaryImage(image),
      () => setLoadingImage(false),
    );
  };

  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString("es-AR")}`;
  };

  const formatearEnvio = (costoEnvio: string) => {
    if (costoEnvio === "G") {
      return (
        <div className="envio-gratis">
          <img
            src="/icons/truck.svg"
            alt="Envío gratis"
            className="camion-icon"
          />
          <span>Envío gratis a todo el país</span>
        </div>
      );
    }
    if (costoEnvio === "P") {
      return <span className="envio-pago">Envío con costo</span>;
    }
    return <span className="envio-pago">Envío: ${costoEnvio}</span>;
  };

  const imageSrc = imageError
    ? "/icons/no-image.svg"
    : getImageUrl(primaryImage, instrumento.imagen);
  const imageAlt = getImageAltText(primaryImage, instrumento.instrumento);

  const handleCardClick = () => {
    navigate(`/instrumento/${instrumento.id}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/instrumento/${instrumento.id}`);
  };

  const handleImageLoadError = () => {
    setImageError(true);
  };

  return (
    <div className="instrumento-card" onClick={handleCardClick}>
      <div className="imagen-container">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="instrumento-imagen"
          onError={(e) => {
            handleImageError(e, instrumento.id);
            handleImageLoadError();
          }}
        />
      </div>

      <div className="instrumento-info">
        <h3 className="instrumento-titulo">{instrumento.instrumento}</h3>

        <div className="precio-container">
          <span
            className="precio"
            data-price={formatearPrecio(instrumento.precio)}
          >
            {formatearPrecio(instrumento.precio)}
          </span>
        </div>

        <div className="envio-container">
          {formatearEnvio(instrumento.costoEnvio)}
        </div>

        <div className="vendidos-container">
          <span className="vendidos">
            {instrumento.cantidadVendida} vendidos
          </span>
        </div>

        <button className="btn-detalle" onClick={handleButtonClick}>
          Ver Detalle
        </button>
      </div>
    </div>
  );
};
