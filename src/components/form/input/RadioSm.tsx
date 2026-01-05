import React from "react";

interface RadioProps {
  id: string; // ID único para el botón de opción
  name: string; // Nombre del grupo de radio
  value: string; // Valor del botón de opción
  checked: boolean; // Si el botón de opción está seleccionado
  label: string; // Texto de la etiqueta para el botón de opción
  onChange: (value: string) => void; // Manejador para cuando se cambia el botón de opción
  className?: string; // Clases personalizadas opcionales para el estilo
}

const RadioSm: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer select-none items-center text-sm text-gray-500 dark:text-gray-400 ${className}`}
    >
      <span className="relative">
        {/* Entrada Oculta */}
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        {/* Círculo de radio estilizado */}
        <span
          className={`mr-2 flex h-4 w-4 items-center justify-center rounded-full border ${
            checked
              ? "border-brand-500 bg-brand-500"
              : "bg-transparent border-gray-300 dark:border-gray-700"
          }`}
        >
          {/* Punto interior */}
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              checked ? "bg-white" : "bg-white dark:bg-[#1e2636]"
            }`}
          ></span>
        </span>
      </span>
      {label}
    </label>
  );
};

export default RadioSm;
