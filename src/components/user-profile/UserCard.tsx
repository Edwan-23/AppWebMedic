"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import Image from "next/image";

interface Usuario {
  nombres: string;
  apellidos: string;
  correo_corporativo: string;
  sexo?: string;
  roles?: {
    nombre: string;
  };
  hospitales?: {
    nombre: string;
  };
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  }, []);

  const handleSave = () => {

    console.log("Guardando cambios...");
    closeModal();
  };

  const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}` : "Cargando...";
  const imagenPerfil = usuario?.sexo === "Mujer" ? "/images/user/mujer.jpg" : "/images/user/hombre.jpg";

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <Image
                width={80}
                height={80}
                src={imagenPerfil}
                alt="user"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {nombreCompleto}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {usuario?.roles?.nombre || "Usuario"}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {usuario?.hospitales?.nombre || "Hospital"}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
