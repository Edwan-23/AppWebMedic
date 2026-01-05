import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Clases predeterminadas que se aplican por defecto
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",

        // Clases definidas por el usuario que pueden anular el margen predeterminado
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
