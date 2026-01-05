import React, { ReactNode } from "react";

// Accesorios de la tabla
interface TableProps {
  children: ReactNode; // Contenido de la tabla (thead, tbody, etc.)
  className?: string; // Clase CSS opcional para estilos
}

// Accesorios para TableHeader
interface TableHeaderProps {
  children: ReactNode; // Filas de encabezado
  className?: string; // Clase CSS opcional para estilos
}

// Accesorios para TableBody
interface TableBodyProps {
  children: ReactNode; // Fila(s) del cuerpo
  className?: string; // Clase CSS opcional para estilos
}

// Accesorios para TableRow
interface TableRowProps {
  children: ReactNode; // Células (th o td)
  className?: string; // Clase CSS opcional para estilos
}

// Accesorios para TableCell
interface TableCellProps {
  children: ReactNode; // Contenido de la célula
  isHeader?: boolean; // Si es true, se renderiza como <th>, de lo contrario como <td>
  className?: string; // Clase CSS opcional para estilos
}

// Componente de la tabla
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// Componente TableHeader
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// Componente TableBody
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// Componente TableRow
const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

// Componente TableCell
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className}`}>{children}</CellTag>;
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
