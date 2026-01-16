"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ComponentCard from "@/components/common/ComponentCard";
import {
    TableIcon,
    UserIcon,
    PlusIcon,
    PlugInIcon,
    GridIcon,
    LockIcon
} from "@/icons/index";

export default function AjustesPage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usuarioData = localStorage.getItem("usuario");
        if (usuarioData) {
            const user = JSON.parse(usuarioData);
            setUsuario(user);

            // Verificar si es administrador
            if (user.rol_id !== "1") {
                router.push("/");
                return;
            }
        } else {
            router.push("/sesion");
            return;
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Cargando...</div>
            </div>
        );
    }

    if (!usuario || usuario.rol_id !== "1") {
        return null;
    }

    const settingsSections = [

        {
            title: "Usuarios",
            description: "Administra los usuarios registrados y sus permisos.",
            icon: <UserIcon />,
            href: "/ajustes/usuarios",
            color: "bg-indigo-500",
        },
        {
            title: "Hospitales",
            description: "Visualiza y edita la información de los hospitales.",
            icon: <GridIcon />,
            href: "/ajustes/hospitales",
            color: "bg-cyan-500",
        },
        {
            title: "Medicamentos",
            description: "Gestión e inventario de los medicamentos.",
            icon: <TableIcon />,
            href: "/ajustes/medicamentos",
            color: "bg-blue-500",
        },
        {
            title: "Avisos",
            description: "Publica y gestiona los avisos del sistema.",
            icon: <PlusIcon />,
            href: "/ajustes/avisos",
            color: "bg-yellow-500",
        },
        {
            title: "Auditoria (Pendiente)",
            description: "Gestiona los cambios realizados en el sistema.",
            icon: <LockIcon />,
            href: "/ajustes/seguridad",
            color: "bg-red-500",
        },
    ];

    return (
        <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">

                <div className="mt-2  rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                    <div className="flex items-start gap-3">
                        <svg
                            className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div>
                            <h5 className="font-medium text-yellow-800 dark:text-yellow-300">
                                Precaución
                            </h5>
                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                                Los cambios realizados en los módulos afectarán los datos del sistema.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-7 mt-4">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Panel de Administración
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Gestione algunos aspectos del sistema desde los diferentes módulos disponibles.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {settingsSections.map((section, index) => (
                        <Link
                            key={index}
                            href={section.href}
                            className="group block rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-brand-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-brand-600"
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${section.color} text-white`}
                                >
                                    {section.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-800 group-hover:text-brand-600 dark:text-white/90 dark:group-hover:text-brand-400">
                                        {section.title}
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {section.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>


            </div>
        </div>
    );
}
