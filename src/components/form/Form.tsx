import React, { FC, ReactNode, FormEvent } from "react";

interface FormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

const Form: FC<FormProps> = ({ onSubmit, children, className }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault(); // Evitar el envío de formulario predeterminado
        onSubmit(event);
      }}
      className={` ${className}`} // Espaciado predeterminado entre campos del formulario
    >
      {children}
    </form>
  );
};

export default Form;
