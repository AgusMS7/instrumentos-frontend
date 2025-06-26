"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img
            src="/icons/logo.svg"
            alt="Symphoniac"
            className="navbar-logo-icon"
          />
          <span>Symphoniac</span>
        </Link>

        <div className={`navbar-menu ${mobileMenuOpen ? "active" : ""}`}>
          <Link
            to="/"
            className={`navbar-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/donde-estamos"
            className={`navbar-link ${location.pathname === "/donde-estamos" ? "active" : ""}`}
          >
            Donde Estamos
          </Link>
          <Link
            to="/productos"
            className={`navbar-link ${location.pathname === "/productos" ? "active" : ""}`}
          >
            Productos
          </Link>
          <Link
            to="/admin"
            className={`navbar-link ${location.pathname === "/admin" ? "active" : ""}`}
          >
            Administración
          </Link>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`menu-icon ${mobileMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>
    </nav>
  );
};
