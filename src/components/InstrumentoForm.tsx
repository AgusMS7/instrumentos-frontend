"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import type { Instrumento } from "../types/Instrumento";
import type { Categoria } from "../types/Categoria";
import { imageService } from "../services/api";
import "./InstrumentoForm.css";

interface InstrumentoFormProps {
  instrumento?: Instrumento | null;
  categorias: Categoria[];
  onSubmit: (data: any) => Promise<any>;
  onCancel: () => void;
}

export const InstrumentoForm = ({
  instrumento,
  categorias,
  onSubmit,
  onCancel,
}: InstrumentoFormProps) => {
  const [formData, setFormData] = useState({
    instrumento: "",
    marca: "",
    modelo: "",
    imagen: "",
    precio: "",
    costoEnvio: "0",
    cantidadVendida: "0",
    descripcion: "",
    idCategoria: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [envioGratis, setEnvioGratis] = useState(true);
  const [costoEnvioCustom, setCostoEnvioCustom] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (instrumento) {
      setFormData({
        instrumento: instrumento.instrumento || "",
        marca: instrumento.marca || "",
        modelo: instrumento.modelo || "",
        imagen: instrumento.imagen || "",
        precio: instrumento.precio?.toString() || "",
        costoEnvio: instrumento.costoEnvio || "0",
        cantidadVendida: instrumento.cantidadVendida?.toString() || "0",
        descripcion: instrumento.descripcion || "",
        idCategoria: instrumento.idCategoria?.toString() || "",
      });

      // Configurar envío
      if (instrumento.costoEnvio === "G" || instrumento.costoEnvio === "0") {
        setEnvioGratis(true);
        setCostoEnvioCustom("");
      } else {
        setEnvioGratis(false);
        setCostoEnvioCustom(instrumento.costoEnvio);
      }

      // Configurar preview de imagen - priorizar imagen principal del nuevo sistema
      loadImagePreview(instrumento.id);
    }
  }, [instrumento]);

  const loadImagePreview = async (instrumentoId: number) => {
    try {
      // Intentar obtener la imagen principal del nuevo sistema
      const primaryResponse = await imageService.getPrimary(instrumentoId);
      if (primaryResponse.success && primaryResponse.data) {
        setImagePreview(
          imageService.getImageUrl(primaryResponse.data.imageUrl),
        );
        setCurrentImageId(primaryResponse.data.id);
        return;
      } else {
        // No hay imagen principal configurada, intentar con imagen legacy
        console.log(
          `No hay imagen principal configurada para instrumento ${instrumentoId}, intentando con imagen legacy`,
        );
      }
    } catch (error) {
      // Error de conexión, intentar con imagen legacy
      console.log(
        `No se pudo cargar imagen principal para instrumento ${instrumentoId}, intentando con imagen legacy`,
      );
    }

    // Si no hay imagen principal, usar la imagen legacy
    if (instrumento?.imagen) {
      setImagePreview(imageService.getImageUrl(instrumento.imagen));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.instrumento.trim()) {
      newErrors.instrumento = "El nombre del instrumento es requerido";
    }

    if (!formData.marca.trim()) {
      newErrors.marca = "La marca es requerida";
    }

    if (!formData.modelo.trim()) {
      newErrors.modelo = "El modelo es requerido";
    }

    if (!formData.precio.trim()) {
      newErrors.precio = "El precio es requerido";
    } else if (isNaN(Number(formData.precio)) || Number(formData.precio) <= 0) {
      newErrors.precio = "El precio debe ser un número válido mayor a 0";
    }

    if (!formData.idCategoria) {
      newErrors.idCategoria = "Debe seleccionar una categoría";
    }

    if (
      !envioGratis &&
      (!costoEnvioCustom ||
        isNaN(Number(costoEnvioCustom)) ||
        Number(costoEnvioCustom) < 0)
    ) {
      newErrors.costoEnvio = "Debe ingresar un costo de envío válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB.");
        return;
      }

      setSelectedFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = async () => {
    if (!currentImageId) {
      // Si no hay imagen del nuevo sistema, solo limpiar preview
      setImagePreview(null);
      setSelectedFile(null);
      return;
    }

    if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await imageService.delete(currentImageId);
      setImagePreview(null);
      setCurrentImageId(null);
      setSelectedFile(null);
      console.log("Imagen eliminada exitosamente");
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("Error al eliminar la imagen");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Determinar costo de envío
      const costoEnvioFinal = envioGratis ? "G" : costoEnvioCustom;

      // Crear el objeto con la estructura exacta que espera tu API Spring Boot
      const submitData = {
        instrumento: formData.instrumento,
        marca: formData.marca,
        modelo: formData.modelo,
        imagen: formData.imagen || null,
        precio: Number.parseFloat(formData.precio),
        costoEnvio: costoEnvioFinal,
        cantidadVendida: Number.parseInt(formData.cantidadVendida) || 0,
        descripcion: formData.descripcion || "",
        categoria: {
          id: Number.parseInt(formData.idCategoria),
        },
      };

      console.log("Enviando datos:", submitData);

      // Guardar el instrumento y obtener la respuesta
      const response = await onSubmit(submitData);
      console.log("Respuesta del submit:", response);

      // Obtener el ID del instrumento (puede venir de diferentes formas según la respuesta)
      let instrumentoId: number | null = null;

      if (response?.data?.id) {
        instrumentoId = response.data.id;
      } else if (response?.id) {
        instrumentoId = response.id;
      } else if (instrumento?.id) {
        // Si estamos editando, usar el ID existente
        instrumentoId = instrumento.id;
      }

      // Si hay una imagen seleccionada y tenemos un ID, subirla
      if (selectedFile && instrumentoId) {
        try {
          console.log(`Subiendo imagen para instrumento ID: ${instrumentoId}`);
          const uploadResponse = await imageService.upload(
            instrumentoId,
            selectedFile,
            formData.instrumento,
            true,
          );
          console.log("Imagen subida exitosamente:", uploadResponse);

          // Actualizar el preview con la nueva imagen subida
          if (uploadResponse.success && uploadResponse.data) {
            setImagePreview(
              imageService.getImageUrl(uploadResponse.data.imageUrl),
            );
            setCurrentImageId(uploadResponse.data.id);
          }
        } catch (imageError) {
          console.error("Error subiendo imagen:", imageError);
          alert(
            "El instrumento se guardó correctamente, pero hubo un error al subir la imagen. Puedes editarlo después para agregar la imagen.",
          );
        }
      }

      // Cerrar el formulario después de un guardado exitoso
      setTimeout(() => {
        onCancel(); // Esto cierra el formulario y vuelve a la lista
      }, 1000);
    } catch (error) {
      console.error("Error en submit:", error);
      alert("Error al guardar el instrumento: " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEnvioChange = (esGratis: boolean) => {
    setEnvioGratis(esGratis);
    if (esGratis) {
      setCostoEnvioCustom("");
      setErrors((prev) => ({ ...prev, costoEnvio: "" }));
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1 className="section-title">
          {instrumento ? "Editar Instrumento" : "Crear Nuevo Instrumento"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="instrumento-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="instrumento">
              Instrumento <span className="required">*</span>
            </label>
            <input
              type="text"
              id="instrumento"
              name="instrumento"
              value={formData.instrumento}
              onChange={handleChange}
              className={errors.instrumento ? "error" : ""}
              placeholder="Ej: Guitarra Acústica"
            />
            {errors.instrumento && (
              <span className="error-message">{errors.instrumento}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="marca">
              Marca <span className="required">*</span>
            </label>
            <input
              type="text"
              id="marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              className={errors.marca ? "error" : ""}
              placeholder="Ej: Yamaha"
            />
            {errors.marca && (
              <span className="error-message">{errors.marca}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="modelo">
              Modelo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
              className={errors.modelo ? "error" : ""}
              placeholder="Ej: FG800"
            />
            {errors.modelo && (
              <span className="error-message">{errors.modelo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="idCategoria">
              Categoría <span className="required">*</span>
            </label>
            <select
              id="idCategoria"
              name="idCategoria"
              value={formData.idCategoria}
              onChange={handleChange}
              className={errors.idCategoria ? "error" : ""}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.denominacion}
                </option>
              ))}
            </select>
            {errors.idCategoria && (
              <span className="error-message">{errors.idCategoria}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="precio">
              Precio <span className="required">*</span>
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className={errors.precio ? "error" : ""}
                placeholder="25000"
                min="0"
                step="0.01"
              />
            </div>
            {errors.precio && (
              <span className="error-message">{errors.precio}</span>
            )}
          </div>

          <div className="form-group">
            <label>Costo de Envío</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="envioType"
                  checked={envioGratis}
                  onChange={() => handleEnvioChange(true)}
                />
                <span className="radio-custom"></span>
                Envío gratis
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="envioType"
                  checked={!envioGratis}
                  onChange={() => handleEnvioChange(false)}
                />
                <span className="radio-custom"></span>
                Con costo
              </label>
            </div>
            {!envioGratis && (
              <div
                className="input-with-prefix"
                style={{ marginTop: "0.5rem" }}
              >
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  value={costoEnvioCustom}
                  onChange={(e) => setCostoEnvioCustom(e.target.value)}
                  className={errors.costoEnvio ? "error" : ""}
                  placeholder="1500"
                  min="0"
                />
              </div>
            )}
            {errors.costoEnvio && (
              <span className="error-message">{errors.costoEnvio}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cantidadVendida">Cantidad Vendida</label>
            <input
              type="number"
              id="cantidadVendida"
              name="cantidadVendida"
              value={formData.cantidadVendida}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group full-width">
            <label>Imagen del Producto</label>
            <div className="image-upload-container">
              <div className="image-preview">
                {imagePreview ? (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="preview-image"
                  />
                ) : (
                  <div className="preview-placeholder">
                    <span>📷</span>
                    <p>Sin imagen</p>
                  </div>
                )}
              </div>
              <div className="image-upload-controls">
                <div className="image-buttons">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline"
                  >
                    📁 Seleccionar Imagen
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="btn btn-danger"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "🗑️ Eliminando..." : "🗑️ Eliminar"}
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <small className="form-help">
                  Formatos: JPG, PNG, GIF. Máximo 5MB.
                </small>
                {selectedFile && (
                  <small
                    className="form-help"
                    style={{ color: "var(--color-primary)" }}
                  >
                    ✓ Archivo seleccionado: {selectedFile.name}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="descripcion">Descripci��n</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
            placeholder="Descripción detallada del instrumento..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando..."
              : instrumento
                ? "Actualizar"
                : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};
