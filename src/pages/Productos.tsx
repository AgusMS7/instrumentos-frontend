"use client"

import { useState, useEffect } from "react"
import { InstrumentoCard } from "../components/InstrumentoCard"
import { FiltroCategoria } from "../components/FiltroCategoria"
import { ErrorScreen } from "../components/ErrorScreen"
import type { Instrumento, Categoria } from "../types/Instrumento"
import { instrumentoService, categoriaService } from "../services/api"
import "./Productos.css"

export const Productos = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])
  const [instrumentosFiltrados, setInstrumentosFiltrados] = useState<Instrumento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("")
  const [busqueda, setBusqueda] = useState("")
  const [ordenamiento, setOrdenamiento] = useState("nombre")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const instrumentosPorPagina = 12

  const fetchData = async () => {
    try {
      setError(null)
      const [instrumentosRes, categoriasRes] = await Promise.all([
        instrumentoService.getAllSimple(),
        categoriaService.getAll(),
      ])

      console.log("Productos - Instrumentos response:", instrumentosRes)

      // Manejar respuesta de instrumentos - evitar duplicados
      let instrumentosArray: Instrumento[] = []
      if (Array.isArray(instrumentosRes)) {
        instrumentosArray = instrumentosRes
      } else if (instrumentosRes.content && Array.isArray(instrumentosRes.content)) {
        instrumentosArray = instrumentosRes.content
      } else if (instrumentosRes.success && instrumentosRes.data && Array.isArray(instrumentosRes.data)) {
        instrumentosArray = instrumentosRes.data
      } else if (instrumentosRes.data && Array.isArray(instrumentosRes.data)) {
        instrumentosArray = instrumentosRes.data
      }

      // Eliminar duplicados por ID
      const instrumentosUnicos = instrumentosArray.filter(
        (instrumento, index, self) => index === self.findIndex((i) => i.id === instrumento.id),
      )

      setInstrumentos(instrumentosUnicos)

      // Manejar respuesta de categorías
      let categoriasArray: Categoria[] = []
      if (Array.isArray(categoriasRes)) {
        categoriasArray = categoriasRes
      } else if (categoriasRes.success && categoriasRes.data && Array.isArray(categoriasRes.data)) {
        categoriasArray = categoriasRes.data
      } else if (categoriasRes.data && Array.isArray(categoriasRes.data)) {
        categoriasArray = categoriasRes.data
      }

      setCategorias(categoriasArray)
    } catch (error) {
      console.error("Error conectando al backend:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setInstrumentos([])
      setCategorias([])
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    aplicarFiltros()
    setPaginaActual(1) // Resetear a primera página cuando cambian los filtros
  }, [instrumentos, categoriaSeleccionada, busqueda, ordenamiento])

  const aplicarFiltros = () => {
    let resultado = [...instrumentos]

    // Filtrar por categoría
    if (categoriaSeleccionada) {
      resultado = resultado.filter((instrumento) => instrumento.idCategoria === Number(categoriaSeleccionada))
    }

    // Filtrar por búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase()
      resultado = resultado.filter(
        (instrumento) =>
          instrumento.instrumento.toLowerCase().includes(busquedaLower) ||
          instrumento.marca.toLowerCase().includes(busquedaLower) ||
          instrumento.modelo.toLowerCase().includes(busquedaLower),
      )
    }

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case "nombre":
          return a.instrumento.localeCompare(b.instrumento)
        case "precio-asc":
          return a.precio - b.precio
        case "precio-desc":
          return b.precio - a.precio
        case "marca":
          return a.marca.localeCompare(b.marca)
        case "vendidos":
          return (b.cantidadVendida || 0) - (a.cantidadVendida || 0)
        default:
          return 0
      }
    })

    setInstrumentosFiltrados(resultado)
  }

  const handleRetry = () => {
    setIsRetrying(true)
    setLoading(true)
    fetchData()
  }

  const handleCategoriaChange = (categoriaId: string) => {
    setCategoriaSeleccionada(categoriaId)
  }

  const limpiarFiltros = () => {
    setCategoriaSeleccionada("")
    setBusqueda("")
    setOrdenamiento("nombre")
  }

  // Lógica de paginación
  const totalPaginas = Math.ceil(instrumentosFiltrados.length / instrumentosPorPagina)
  const indiceInicio = (paginaActual - 1) * instrumentosPorPagina
  const indiceFin = indiceInicio + instrumentosPorPagina
  const instrumentosPaginados = instrumentosFiltrados.slice(indiceInicio, indiceFin)

  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const generarNumerosPagina = () => {
    const numeros = []
    const maxVisible = 5
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisible / 2))
    const fin = Math.min(totalPaginas, inicio + maxVisible - 1)

    if (fin - inicio < maxVisible - 1) {
      inicio = Math.max(1, fin - maxVisible + 1)
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i)
    }
    return numeros
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorScreen
        title="Error al cargar productos"
        message="No se pudieron cargar los productos desde el servidor."
        details={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    )
  }

  return (
    <div className="productos-container">
      <div className="productos-header-full-width">
        <div className="productos-header-content">
          <h1>Nuestros Productos</h1>
          <p>Explora nuestra colección de instrumentos musicales de alta calidad</p>
        </div>
      </div>

      <main className="productos-content">
        <div className="productos-filters">
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="busqueda">Buscar:</label>
              <input
                id="busqueda"
                type="text"
                placeholder="Buscar por nombre, marca o modelo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <FiltroCategoria
                categorias={categorias}
                categoriaSeleccionada={categoriaSeleccionada}
                onCategoriaChange={handleCategoriaChange}
                loading={loading}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="ordenamiento">Ordenar por:</label>
              <select
                id="ordenamiento"
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                className="filter-select"
              >
                <option value="nombre">Nombre A-Z</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="marca">Marca A-Z</option>
                <option value="vendidos">Más Vendidos</option>
              </select>
            </div>

            <div className="filter-group">
              <button onClick={limpiarFiltros} className="btn btn-outline btn-small">
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        <div className="productos-stats">
          <p>
            Mostrando {instrumentosPaginados.length} de {instrumentosFiltrados.length} instrumentos
            {totalPaginas > 1 && ` (Página ${paginaActual} de ${totalPaginas})`}
          </p>
        </div>

        <div className="instrumentos-grid">
          {instrumentosPaginados.map((instrumento) => (
            <InstrumentoCard key={`instrumento-${instrumento.id}`} instrumento={instrumento} />
          ))}
        </div>

        {instrumentosFiltrados.length === 0 && !loading && (
          <div className="no-results">
            <p>No se encontraron instrumentos que coincidan con los filtros aplicados.</p>
            <button onClick={limpiarFiltros} className="btn btn-primary">
              Limpiar Filtros
            </button>
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="pagination">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="pagination-btn pagination-prev"
            >
              ← Anterior
            </button>

            <div className="pagination-numbers">
              {paginaActual > 3 && (
                <>
                  <button onClick={() => cambiarPagina(1)} className="pagination-number">
                    1
                  </button>
                  {paginaActual > 4 && <span className="pagination-dots">...</span>}
                </>
              )}

              {generarNumerosPagina().map((numero) => (
                <button
                  key={numero}
                  onClick={() => cambiarPagina(numero)}
                  className={`pagination-number ${numero === paginaActual ? "active" : ""}`}
                >
                  {numero}
                </button>
              ))}

              {paginaActual < totalPaginas - 2 && (
                <>
                  {paginaActual < totalPaginas - 3 && <span className="pagination-dots">...</span>}
                  <button onClick={() => cambiarPagina(totalPaginas)} className="pagination-number">
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="pagination-btn pagination-next"
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Productos
