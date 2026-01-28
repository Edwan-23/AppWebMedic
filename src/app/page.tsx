"use client";

import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HomePage() {
    const [scrollY, setScrollY] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Auto-animate process steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const processSteps = [
        {
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            title: "Publica",
            description: "Registra medicamentos disponibles con información completa y verificada"
        },
        {
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            title: "Intercambia",
            description: "Negocia y coordina intercambios seguros entre hospitales"
        },
        {
            icon: (
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            title: "Envía",
            description: "Coordina transporte con seguimiento en tiempo real"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            <LandingHeader />

            {/* Hero Section con Parallax */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 -z-10">
                    <div
                        className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-blue-500/10 to-purple-500/10 dark:from-brand-500/20 dark:via-blue-500/20 dark:to-purple-500/20"
                        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                    ></div>
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
                    </div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12 animate-fade-in">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                Conectamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-600"> + Hospitales</span>
                                <br />
                                Salvamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-600"> + Vidas</span>
                            </h1>
                            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                                Optimiza la distribución de medicamentos entre hospitales con tecnología de vanguardia.
                                Reduce desperdicios y mejora el acceso a medicina esencial.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                                <Link
                                    href="/registro"
                                    className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform duration-300"
                                >
                                    Comenzar ahora
                                    <svg className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/sesion"
                                    className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-700"
                                >
                                    Iniciar sesión
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </section>

            {/* Proceso Interactivo con Animaciones */}
            <section className="py-24 lg:py-32 bg-white dark:bg-gray-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl font-bold text-brand-500 mb-4">
                            ¿Cómo Funciona?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Un proceso simple y eficiente en 3 pasos
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="relative">
                            {/* Connection Lines */}
                            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-brand-500 transform -translate-y-1/2 opacity-20"></div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {processSteps.map((step, idx) => (
                                    <div
                                        key={idx}
                                        className={`relative group transition-all duration-500 ${activeStep === idx ? "scale-110" : "scale-100"
                                            }`}
                                    >
                                        {/* Card */}
                                        <div className={`relative bg-gradient-to-br ${activeStep === idx
                                            ? "from-brand-500 to-brand-600 text-white shadow-2xl"
                                            : "from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 shadow-lg"
                                            } rounded-2xl p-8 transition-all duration-500`}>
                                            {/* Step Number */}
                                            <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === idx
                                                ? "bg-white text-brand-600"
                                                : "bg-brand-500 text-white"
                                                } shadow-lg`}>
                                                {idx + 1}
                                            </div>

                                            {/* Icon */}
                                            <div className={`mb-4 flex justify-center ${activeStep === idx ? "animate-pulse" : ""}`}>
                                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${activeStep === idx
                                                    ? "bg-white/20"
                                                    : "bg-brand-100 dark:bg-brand-900/30"
                                                    }`}>
                                                    <div className={activeStep === idx ? "text-white" : "text-brand-500"}>
                                                        {step.icon}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <h3 className="text-xl font-bold mb-2 text-center">
                                                {step.title}
                                            </h3>
                                            <p className={`text-sm text-center ${activeStep === idx ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                                                }`}>
                                                {step.description}
                                            </p>
                                        </div>

                                        {/* Arrow (desktop only) */}
                                        {idx < processSteps.length - 1 && (
                                            <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-20">
                                                <svg className={`w-8 h-8 ${activeStep === idx ? "text-brand-500 animate-pulse" : "text-gray-300 dark:text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de Donaciones */}
            <section className="py-24 lg:py-32 bg-red-50 dark:bg-red-950/20 relative overflow-hidden">
                <div className="absolute top-10 left-10 w-64 h-64 bg-red-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-brand-500 mb-6 text-center">
                                Donaciones entre Hospitales
                            </h2>
                            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                                Cada medicamento donado es una oportunidad de vida. Ayuda a otros hospitales
                                compartiendo lo que tienes disponible.
                            </p>
                        </div>

                       {/* Ilustración Creativa de Donación - 5 pasos */}
                       <div className="w-full flex items-center justify-center">
<div className="flex flex-col md:flex-row items-center justify-center gap-6 py-20 relative max-w-6xl mx-auto">

      {/* Donación */}
      <div className="animate-fadeInUp text-brand-500">
        <svg
          className="w-24 h-24 mx-auto"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 21s-6-4.35-9-7.5C-1 9 4 3 8 7l4 4 4-4c4-4 9 2 5 6.5-3 3.15-9 7.5-9 7.5z" />
        </svg>
        <p className="text-center mt-3 font-semibold">Donación</p>
      </div>

      {/* Flujo animado verde */}
      <div className="hidden md:block relative z-10">
        <div className="relative w-20 h-2 bg-success-200 dark:bg-success-800 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 w-1/2 bg-success-500 rounded-full animate-flow shadow-lg" style={{ animationDelay: "0.5s" }} />
        </div>
      </div>

      {/* 3. Medicamento avanzado (cápsula con detalles) */}
      <div
        className="animate-fadeInUp animate-float relative z-10"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-xl">
          <svg
            className="w-20 h-20 mx-auto text-orange-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        </div>
        <p className="text-center mt-3 font-semibold text-gray-700 dark:text-gray-300">Medicamento</p>
      </div>

      {/* Flujo animado verde */}
      <div className="hidden md:block relative z-10">
        <div className="relative w-20 h-2 bg-success-200 dark:bg-success-800 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 w-1/2 bg-success-500 rounded-full animate-flow shadow-lg" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* 4. Hospital (edificio) */}
      <div
        className="animate-fadeInUp relative z-10"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-xl">
          <svg
            className="w-20 h-20 mx-auto text-brand-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
        </div>
        <p className="text-center mt-3 font-semibold text-gray-700 dark:text-gray-300">Hospital</p>
      </div>

      {/* Flujo animado verde */}
      <div className="hidden md:block relative z-10">
        <div className="relative w-20 h-2 bg-success-200 dark:bg-success-800 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 w-1/2 bg-success-500 rounded-full animate-flow shadow-lg" style={{ animationDelay: "1.5s" }} />
        </div>
      </div>

      {/* 5. Corazón (vida salvada) */}
      <div
        className="animate-fadeInUp animate-float relative z-10"
        style={{ animationDelay: "0.8s" }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-full p-4 shadow-xl">
          <svg
            className="w-20 h-20 mx-auto text-red-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <p className="text-center mt-3 font-semibold text-gray-700 dark:text-gray-300">Vida</p>
      </div>

    </div>
                       </div>


                    </div>
                </div>
            </section>

            {/* Responsive Showcase - Web & Móvil */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl sm:text-4xl font-bold text-brand-500 mb-3">Disponible en Web y Móvil</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Accede desde cualquier dispositivo, en cualquier momento</p>
                        </div>

                        <div className="relative flex items-center justify-center gap-8 lg:gap-12">
                            {/* Desktop Monitor */}
                            <div className="hidden md:block transform hover:scale-105 transition-transform duration-500">
                                <div className="bg-gray-800 rounded-t-xl p-2 shadow-2xl border-2 border-gray-700">
                                    <div className="h-2 bg-gray-700 rounded-t-lg mb-2"></div>
                                    <div className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden" style={{ width: '450px', height: '250px' }}>
                                        <div className="grid grid-cols-3 gap-3 p-4 h-full">
                                            {processSteps.map((step, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex flex-col items-center justify-center rounded-lg p-3 transition-all duration-700 ${activeStep === idx
                                                        ? "bg-brand-500 text-white scale-105 shadow-xl"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 scale-100"
                                                        }`}
                                                >
                                                    <div className={`transform transition-transform duration-700 ${activeStep === idx ? "scale-110 rotate-12" : "scale-100 rotate-0"
                                                        }`}>
                                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {idx === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
                                                            {idx === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
                                                            {idx === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />}
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs font-semibold mt-2">{step.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-700 h-3 w-56 mx-auto rounded-b-lg"></div>
                                <div className="bg-gray-600 h-8 w-40 mx-auto rounded-b-xl"></div>
                            </div>

                            {/* Animated Arrow */}
                            <div className="hidden lg:block text-brand-500 animate-pulse">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>

                            {/* Mobile Phone */}
                            <div className="transform hover:scale-180 transition-transform duration-500">
                                <div className="bg-gray-800 rounded-3xl p-2 shadow-2xl border-4 border-gray-700" style={{ width: '180px' }}>
                                    <div className="w-16 h-1 bg-gray-700 rounded-full mx-auto mb-1"></div>
                                    <div className="bg-white dark:bg-gray-950 rounded-2xl overflow-hidden" style={{ height: '250px' }}>
                                        <div className="flex flex-col gap-2 p-3 h-full justify-center">
                                            {processSteps.map((step, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-700 ${activeStep === idx
                                                        ? "bg-brand-500 text-white translate-x-1 shadow-lg"
                                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 translate-x-0"
                                                        }`}
                                                >
                                                    <div className={`transform transition-transform duration-700 flex-shrink-0 ${activeStep === idx ? "scale-110 rotate-12" : "scale-100 rotate-0"
                                                        }`}>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {idx === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />}
                                                            {idx === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />}
                                                            {idx === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />}
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs font-semibold truncate">{step.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 bg-gray-700 rounded-full mx-auto mt-1"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección Nosotros */}
            <section id="nosotros" className="py-16 lg:py-24 bg-white dark:bg-gray-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-brand-500 mb-8 text-center">
                            ¿Quiénes Somos?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12">
                            Plataforma innovadora que revoluciona la gestión de medicamentos entre hospitales
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="w-12 h-12 mx-auto mb-4 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Innovación</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Tecnología de vanguardia para optimizar recursos</p>
                            </div>
                            <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="w-12 h-12 mx-auto mb-4 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Colaboración</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Red de cooperación entre instituciones de salud</p>
                            </div>
                            <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="w-12 h-12 mx-auto mb-4 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Seguridad</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Trazabilidad completa en cada transacción</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección Servicios */}
            <section id="servicios" className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-900">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-brand-500 mb-12 text-center">
                            Nuestros Servicios
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gestión de Inventario</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Control detallado de medicamentos en tiempo real</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Intercambio entre Hospitales</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Transferencias seguras y trazables</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gestión de Pagos</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sistema integrado para transacciones</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Logística y Envíos</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Seguimiento completo de entregas</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notificaciones en Tiempo Real</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Alertas instantáneas y avisos importantes</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reportes y Análisis</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Dashboards con estadísticas detalladas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección Objetivos */}
            <section id="objetivos" className="py-16 lg:py-24 bg-white dark:bg-gray-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-brand-500 mb-12 text-center">
                            Nuestros Objetivos
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Optimizar la distribución de medicamentos</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Reducir desperdicios mediante red colaborativa</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Facilitar el acceso a tratamientos</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Conectar instituciones para beneficio de pacientes</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Promover transparencia y trazabilidad</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Registro completo con total seguridad</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="flex-shrink-0 w-8 h-8 bg-brand-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Reducir costos operativos</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Minimizar pérdidas y optimizar inversiones</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <LandingFooter />

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }

                .delay-1000 {
                    animation-delay: 1s;
                }

                .delay-2000 {
                    animation-delay: 2s;
                }

                .bg-grid-pattern {
                    background-image: 
                        linear-gradient(to right, rgb(209 213 219 / 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgb(209 213 219 / 0.1) 1px, transparent 1px);
                    background-size: 40px 40px;
                }
            `}</style>
        </div>
    );
}
