"use client"

import { useState, useEffect } from "react"
import { InstrumentoForm } from "../components/InstrumentoForm"
import { CategoriaAdmin } from "../components/CategoriaAdmin"
import { ErrorScreen } from "../components/ErrorScreen"
import type { Instrumento, Categoria, ProductImage } from "../types/Instrumento"
import { instrumentoService, categoriaService, imageService } from "../services/api"
import "./Admin.css"

export const Admin = () => {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showCategorias, setShowCategorias] = useState(false)
  const [editingInstrumento, setEditingInstrumento] = useState<Instrumento | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string>("")
  const [busqueda, setBusqueda] = useState("")
  const [ordenamiento, setOrdenamiento] = useState("id")
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({})
  const [instrumentoImages, setInstrumentoImages] = useState<{ [key: number]: ProductImage | null }>({})

  const fetchData = async () => {
    try {
      setError(null)
      const [instrumentosRes, categoriasRes] = await Promise.all([
        instrumentoService.getAllSimple(),
        categoriaService.getAll(),
      ])

      console.log("Admin - Instrumentos response:", instrumentosRes)
      console.log("Admin - Categorías response:", categoriasRes)

      // Manejar respuesta de instrumentos
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

      setInstrumentos(instrumentosArray)

      // Cargar imágenes principales para cada instrumento
      loadInstrumentosImages(instrumentosArray)

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
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }

  const loadInstrumentosImages = async (instrumentosArray: Instrumento[]) => {
    const imagePromises = instrumentosArray.map(async (instrumento) => {
      try {
        const response = await imageService.getPrimary(instrumento.id)
        if (response.success && response.data) {
          return { id: instrumento.id, image: response.data }
        }
      } catch (error) {
        console.log(`No hay imagen principal para instrumento ${instrumento.id}`)
      }
      return { id: instrumento.id, image: null }
    })

    const results = await Promise.all(imagePromises)
    const imageMap: { [key: number]: ProductImage | null } = {}
    results.forEach((result) => {
      imageMap[result.id] = result.image
    })
    setInstrumentoImages(imageMap)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRetry = () => {
    setIsRetrying(true)
    setLoading(true)
    fetchData()
  }

  const handleCreate = () => {
    setEditingInstrumento(null)
    setShowForm(true)
  }

  const handleEdit = (instrumento: Instrumento) => {
    setEditingInstrumento(instrumento)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este instrumento?")) {
      return
    }

    try {
      const response = await instrumentoService.delete(id)
      console.log("Delete response:", response)

      // Manejar diferentes tipos de respuesta
      if (response.success || response.status === 200 || !response.error) {
        setInstrumentos((prev) => prev.filter((inst) => inst.id !== id))
      } else {
        throw new Error(response.message || "Error al eliminar")
      }
    } catch (error) {
      alert("Error al eliminar instrumento: " + error)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      let response

      if (editingInstrumento) {
        response = await instrumentoService.update(editingInstrumento.id, data)
      } else {
        response = await instrumentoService.create(data)
      }

      console.log("Form submit response:", response)

      // Manejar diferentes tipos de respuesta
      let savedInstrumento
      if (response.success && response.data) {
        savedInstrumento = response.data
      } else if (response.data) {
        savedInstrumento = response.data
      } else {
        savedInstrumento = response
      }

      if (savedInstrumento) {
        if (editingInstrumento) {
          setInstrumentos((prev) => prev.map((inst) => (inst.id === editingInstrumento.id ? savedInstrumento : inst)))
        } else {
          setInstrumentos((prev) => [...prev, savedInstrumento])
        }

        // Refrescar la lista para mostrar las imágenes actualizadas
        setTimeout(() => {
          fetchData()
        }, 500)

        return savedInstrumento
      } else {
        throw new Error("No se recibió el instrumento guardado")
      }
    } catch (error) {
      console.error("Error al guardar:", error)
      alert("Error al guardar instrumento: " + error)
      throw error
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingInstrumento(null)
    // Refrescar la lista cuando se cancela para mostrar cambios
    fetchData()
  }

  const handleImageError = (instrumentoId: string) => {
    console.log(`Error cargando imagen en admin para instrumento ${instrumentoId}`)
    setImageErrors((prev) => ({ ...prev, [instrumentoId]: true }))
  }

  const getInstrumentoImage = (instrumento: Instrumento) => {
    const instrumentoIdStr = instrumento.id.toString()

    if (imageErrors[instrumentoIdStr]) {
      return "/icons/no-image.svg"
    }

    // Prioridad 1: Imagen principal del nuevo sistema
    const primaryImage = instrumentoImages[instrumento.id]
    if (primaryImage && primaryImage.imageUrl) {
      return imageService.getImageUrl(primaryImage.imageUrl)
    }

    // Prioridad 2: Campo imagen legacy
    if (instrumento.imagen && instrumento.imagen.trim() !== "") {
      return imageService.getImageUrl(instrumento.imagen)
    }

    return "/icons/no-image.svg"
  }

  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString("es-AR")}`
  }

  const getCategoriaName = (idCategoria: number) => {
    const categoria = categorias.find((cat) => cat.id === idCategoria)
    return categoria ? categoria.denominacion : "Sin categoría"
  }

  // Filtrar y ordenar instrumentos
  const instrumentosFiltrados = instrumentos
    .filter((instrumento) => {
      const matchCategoria = !filtroCategoria || instrumento.idCategoria === Number.parseInt(filtroCategoria)
      const matchBusqueda =
        !busqueda ||
        instrumento.instrumento.toLowerCase().includes(busqueda.toLowerCase()) ||
        instrumento.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        instrumento.modelo.toLowerCase().includes(busqueda.toLowerCase())

      return matchCategoria && matchBusqueda
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case "id":
          return a.id - b.id
        case "nombre":
          return a.instrumento.localeCompare(b.instrumento)
        case "marca":
          return a.marca.localeCompare(b.marca)
        case "precio-asc":
          return a.precio - b.precio
        case "precio-desc":
          return b.precio - a.precio
        case "vendidos":
          return (b.cantidadVendida || 0) - (a.cantidadVendida || 0)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorScreen
        title="Error al cargar datos"
        message="No se pudieron cargar los datos desde el servidor."
        details={error}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    )
  }

  if (showForm) {
    return (
      <InstrumentoForm
        instrumento={editingInstrumento}
        categorias={categorias}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    )
  }

  if (showCategorias) {
    return (
      <CategoriaAdmin categorias={categorias} setCategorias={setCategorias} onBack={() => setShowCategorias(false)} />
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header-full-width">
        <div className="admin-header-content">
          <h1 className="section-title">Administración de Instrumentos</h1>
          <div className="admin-buttons">
            <button className="btn btn-outline" onClick={() => setShowCategorias(true)}>
              Administrar Categorías
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Crear Nuevo Instrumento
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-filters">
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
              <label htmlFor="categoria">Filtrar por categoría:</label>
              <select
                id="categoria"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.denominacion}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="ordenamiento">Ordenar por:</label>
              <select
                id="ordenamiento"
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                className="filter-select"
              >
                <option value="id">ID</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="marca">Marca A-Z</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="vendidos">Más Vendidos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-stats">
          <span>
            Mostrando {instrumentosFiltrados.length} de {instrumentos.length} instrumentos
          </span>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Instrumento</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Vendidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {instrumentosFiltrados.map((instrumento) => (
                <tr key={instrumento.id}>
                  <td>
                    <img
                      src={getInstrumentoImage(instrumento) || "/placeholder.svg"}
                      alt={instrumento.instrumento}
                      className="table-image"
                      onError={() => handleImageError(instrumento.id.toString())}
                    />
                  </td>
                  <td className="table-name">{instrumento.instrumento}</td>
                  <td>{instrumento.marca}</td>
                  <td>{instrumento.modelo}</td>
                  <td>{getCategoriaName(instrumento.idCategoria || 0)}</td>
                  <td className="table-price">{formatearPrecio(instrumento.precio)}</td>
                  <td>{instrumento.cantidadVendida}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-action btn-edit" onClick={() => handleEdit(instrumento)} title="Editar">
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(instrumento.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {instrumentosFiltrados.length === 0 && (
            <div className="no-results">
              <p>No se encontraron instrumentos que coincidan con los filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
