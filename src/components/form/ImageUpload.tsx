"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageChange: (url: string | null) => void;
  currentImage?: string | null;
  label?: string;
  tipo?: "publicacion" | "donacion"; // Tipo de imagen para determinar la carpeta
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageChange, 
  currentImage, 
  label = "Imagen de la publicación (opcional)",
  tipo = "publicacion"
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const loadingToast = toast.loading("Subiendo imagen...");

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", tipo); // Agregar tipo de imagen

      // Subir imagen al servidor
      const response = await fetch("/api/upload/imagen", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir la imagen");
      }

      const data = await response.json();
      
      // Actualizar preview y notificar cambio con la URL
      setPreview(data.url);
      onImageChange(data.url);

      toast.success("Imagen subida exitosamente", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      toast.error("Error al subir imagen", {
        description: error instanceof Error ? error.message : "Intente nuevamente",
        id: loadingToast,
      });
    } finally {
      setUploading(false);
    }
  }, [onImageChange, tipo]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
    disabled: uploading,
  });

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="w-full">
      <label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="aspect-square w-full max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
            <Image 
              src={preview} 
              alt="Preview" 
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="mt-3 w-full max-w-xs mx-auto block px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            Eliminar imagen
          </button>
        </div>
      ) : (
        <div className={`transition border-2 border-dashed cursor-pointer rounded-xl hover:border-brand-500 dark:hover:border-brand-500 dark:border-gray-700 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <div
            {...getRootProps()}
            className={`rounded-xl p-6 ${
              isDragActive
                ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
                : "bg-gray-50 dark:bg-gray-900"
            }`}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center">
              {/* Icono */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                  {uploading ? (
                    <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 29 28"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Texto */}
              <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                {uploading ? "Subiendo imagen..." : isDragActive ? "Suelta la imagen aquí" : "Arrastra y suelta una imagen"}
              </h4>

              <span className="mb-4 block text-center text-sm text-gray-600 dark:text-gray-400">
                PNG, JPG, WebP (máx. 5MB)
              </span>

              {!uploading && (
                <span className="font-medium text-sm text-brand-500 underline">
                  Buscar archivo
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
