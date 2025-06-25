"use client"

import type React from "react"
import type { Categoria } from "../types/Categoria"

interface FiltroCategoriaProps {
  categorias: Categoria[]
  categoriaSeleccionada: string
  onCategoriaChange: (categoriaId: string) => void
  loading?: boolean
}

export const FiltroCategoria: React.FC<FiltroCategoriaProps> = ({
  categorias,
  categoriaSeleccionada,
  onCategoriaChange,
  loading = false,
}) => {
  return (
    <div className="filtro-categoria">
      <label htmlFor="categoria-select">Filtrar por categoría:</label>
      <select
        id="categoria-select"
        value={categoriaSeleccionada}
        onChange={(e) => onCategoriaChange(e.target.value)}
        disabled={loading}
        className="filter-select"
      >
        <option value="">Todas las categorías</option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id.toString()}>
            {categoria.denominacion}
          </option>
        ))}
      </select>
    </div>
  )
}
