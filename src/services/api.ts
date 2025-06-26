const API_BASE_URL = "http://localhost:3001/api";

// Servicio para instrumentos
export const instrumentoService = {
  // Obtener todos los instrumentos con paginación
  getAll: async (page = 0, size = 10, sort = "id,asc") => {
    const response = await fetch(
      `${API_BASE_URL}/instrumentos?page=${page}&size=${size}&sort=${sort}`,
    );
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Obtener todos los instrumentos sin paginación (para compatibilidad)
  getAllSimple: async () => {
    const response = await fetch(`${API_BASE_URL}/instrumentos`);
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Obtener instrumento por ID
  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/instrumentos/${id}`);
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Crear nuevo instrumento
  create: async (instrumento: any) => {
    const response = await fetch(`${API_BASE_URL}/instrumentos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instrumento),
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Actualizar instrumento
  update: async (id: number, instrumento: any) => {
    const response = await fetch(`${API_BASE_URL}/instrumentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instrumento),
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Eliminar instrumento
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/instrumentos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Filtrar por categoría
  getByCategoria: async (categoriaId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/instrumentos/categoria/${categoriaId}`,
    );
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Buscar por nombre
  search: async (nombre: string) => {
    const response = await fetch(
      `${API_BASE_URL}/instrumentos/buscar?nombre=${encodeURIComponent(nombre)}`,
    );
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },
};

// Servicio para categorías
export const categoriaService = {
  // Obtener todas las categorías
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categorias`);
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Obtener categoría por ID
  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`);
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Crear nueva categoría
  create: async (categoria: { denominacion: string }) => {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoria),
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Actualizar categoría
  update: async (id: number, categoria: { denominacion: string }) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoria),
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Eliminar categoría
  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },
};

// Servicio para imágenes
export const imageService = {
  // Subir imagen
  upload: async (
    instrumentoId: number,
    file: File,
    altText = "",
    isPrimary = false,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("altText", altText);
    formData.append("isPrimary", isPrimary.toString());

    const response = await fetch(
      `${API_BASE_URL}/images/upload/${instrumentoId}`,
      {
        method: "POST",
        body: formData,
      },
    );
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Obtener imágenes de instrumento
  getByInstrumento: async (instrumentoId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/images/instrumento/${instrumentoId}`,
    );
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Obtener imagen principal
  getPrimary: async (instrumentoId: number) => {
    const response = await fetch(
      `${API_BASE_URL}/images/instrumento/${instrumentoId}/primary`,
    );

    // Si es 404, significa que no hay imagen principal (esto es normal)
    if (response.status === 404) {
      return {
        success: false,
        message: "No se encontró imagen principal",
        data: null,
      };
    }

    // Para otros errores, lanzar excepción
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);

    return response.json();
  },

  // Eliminar imagen
  delete: async (imageId: number) => {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Establecer como principal
  setPrimary: async (imageId: number) => {
    const response = await fetch(`${API_BASE_URL}/images/${imageId}/primary`, {
      method: "PUT",
    });
    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // Obtener URL de imagen
  getImageUrl: (filename: string) => {
    return `http://localhost:3001/images/${filename}`;
  },
};
