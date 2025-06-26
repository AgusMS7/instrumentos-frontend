import React from "react";
import "./Loading.css";

interface LoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "spinner" | "dots" | "pulse";
}

export const Loading: React.FC<LoadingProps> = ({
  message = "Cargando...",
  size = "medium",
  variant = "spinner",
}) => {
  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return (
          <div className={`loading-dots loading-${size}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      case "pulse":
        return (
          <div className={`loading-pulse loading-${size}`}>
            <div className="pulse-circle"></div>
          </div>
        );
      default:
        return (
          <div className={`loading-spinner loading-${size}`}>
            <div className="spinner"></div>
          </div>
        );
    }
  };

  return (
    <div className="loading-container">
      {renderLoader()}
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};
