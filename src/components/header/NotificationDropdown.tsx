"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  referencia_id?: number | null;
  referencia_tipo?: string | null;
  created_at: string;
}

export default function NotificationDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitialized = useRef(false);

  // Inicializar audio al montar el componente
  useEffect(() => {
    // Crear elemento de audio
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.8; // Volumen 80%
    // Pre-cargar el audio
    audioRef.current.load();
    
    // inicializar el audio con la primera interacción del usuario
    const initAudio = () => {
      if (!audioInitialized.current && audioRef.current) {
        // Reproducir y pausar inmediatamente para "desbloquear" el audio
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
          audioRef.current!.currentTime = 0;
          audioInitialized.current = true;
        }).catch(() => {
          // Audio aún no inicializado
        });
        
        // Remover listeners después de inicializar
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      }
    };
    
    // Escuchar primera interacción
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Función para reproducir sonido de notificación
  const reproducirSonido = async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        // Silenciar error si el navegador bloquea el audio
      }
    }
  };

  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  }, []);

  const cargarNotificaciones = useCallback(async () => {
    if (!usuario?.hospital_id) return;

    try {
      const res = await fetch(
        `/api/notificaciones?hospital_id=${usuario.hospital_id}`
      );
      if (!res.ok) throw new Error("Error al cargar notificaciones");
      const data = await res.json();
      setNotificaciones(data.notificaciones || []); // Ya limitadas a 7 desde el backend
    } catch (error) {
      console.error("Error:", error);
    }
  }, [usuario?.hospital_id]);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (usuario?.hospital_id) {
      cargarNotificaciones();
    }
  }, [usuario?.hospital_id, cargarNotificaciones]);

  // Conexión SSE separada
  useEffect(() => {
    if (!usuario?.hospital_id) return;
    
    const eventSource = new EventSource(
      `/api/notificaciones/stream?hospital_id=${usuario.hospital_id}`
    );
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "connected") {
          return;
        }
        
        if (data.type === "nueva_notificacion" && data.notificacion) {
          
          // Validar que tenga ID válido
          if (!data.notificacion.id || data.notificacion.id === 0) {
            toast.error("Error: Notificación recibida sin ID");
            return;
          }
          
          // Agregar nueva notificación al principio y limitar a 7
          setNotificaciones((prev) => {
            // Evitar duplicados
            const existe = prev.some(n => n.id === data.notificacion.id);
            if (existe) return prev;
            
            const nuevasNotificaciones = [data.notificacion, ...prev];
            return nuevasNotificaciones.slice(0, 7); // Máximo 7 notificaciones
          });
          
          // Reproducir sonido de notificación
          reproducirSonido();
          
          // Mostrar notificación temporal
          toast.info(data.notificacion.titulo, {
            description: data.notificacion.mensaje
          });
        }
      } catch (error) {
        console.error("Error procesando evento SSE:", error);
      }
    };
    
    eventSource.onerror = () => {
    };
    
    return () => {
      eventSource.close();
    };
  }, [usuario?.hospital_id]);

  const marcarComoLeida = async (id: number) => {
    if (!id || id === 0) {
      toast.error("Error: Notificación sin ID válido");
      return;
    }
    
    try {
      const res = await fetch(`/api/notificaciones/${id}`, {
        method: "PATCH"
      });

      if (!res.ok) {
        throw new Error("Error al marcar notificación");
      }
      
      // Actualizar estado local
      setNotificaciones(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (error) {
      toast.error("Error al marcar notificación");
    }
  };

  const marcarTodasLeidas = async () => {
    const noLeidas = notificaciones.filter(n => !n.leida);
    
    try {
      await Promise.all(
        noLeidas.map(n => fetch(`/api/notificaciones/${n.id}`, { method: "PATCH" }))
      );

      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      toast.success("Todas las notificaciones marcadas como leídas");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al marcar notificaciones");
    }
  };

  // Función para obtener la ruta según el tipo de notificación
  const obtenerRutaNotificacion = (notif: Notificacion): string => {
    const { referencia_tipo, referencia_id, tipo } = notif;

    // Si hay referencia específica, navegar a la sección correspondiente
    if (referencia_id) {
      switch (referencia_tipo) {
        case "solicitud":
          return "/pedidos";
        case "envio":
          return "/envios";
        case "publicacion":
          return "/publicaciones";
        case "donacion":
        case "corazon":
          return "/donaciones?tipo=recibidas";
        case "pago":
        case "facturacion":
          return "/facturacion";
        default:
          break;
      }
    }

    // Si no hay referencia, navegar según el tipo
    switch (tipo) {
      case "solicitud":
        return "/solicitudes";
      case "envio":
      case "estado_envio":
      case "pin_envio":
        return "/envios";
      case "publicacion":
      case "aviso":
        return "/publicaciones";
      case "donacion":
      case "corazon":
        return "/donaciones?tipo=recibidas";
      case "pago":
      case "pago_exitoso":
      case "pago_realizado":
        return "/facturacion";
      default:
        return "/"; // Dashboard por defecto
    }
  };

  // Función para manejar click en notificación
  const manejarClickNotificacion = (notif: Notificacion) => {
    // Marcar como leída si no lo está
    if (!notif.leida) {
      marcarComoLeida(notif.id);
    }

    // Cerrar dropdown
    closeDropdown();

    // Obtener la ruta de destino
    const rutaDestino = obtenerRutaNotificacion(notif);

    // Verificar si ya estamos en la ruta de destino
    if (pathname === rutaDestino) {
      // Ya estamos en la página correcta, emitir evento y forzar actualización
      window.dispatchEvent(new CustomEvent('actualizarDatos', {
        detail: { tipo: notif.tipo, referencia_id: notif.referencia_id }
      }));
      
      // Forzar navegación a la misma ruta para recargar datos
      router.push(rutaDestino);
      router.refresh();
    } else {
      // Navegar a la ruta correspondiente
      router.push(rutaDestino);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleClick = () => {
    toggleDropdown();
  };

  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case "publicacion":
        return (
          <Image 
            src="/images/icons/archive.svg" 
            alt="Publicación" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        );
      case "envio":
      case "estado_envio":
        return (
          <Image 
            src="/images/icons/truck.svg" 
            alt="Envío" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        );
      case "donacion":
      case "corazon":
        return (
          <Image 
            src="/images/icons/heart.svg" 
            alt="Donación" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        );
      case "solicitud":
        return (
          <Image 
            src="/images/icons/document.svg" 
            alt="Solicitud" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        );
      case "pago":
        return (
          <Image 
            src="/images/icons/credit-card.svg" 
            alt="Pago" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        );
      case "pin_envio":
        return (
          <Image 
            src="/images/icons/key.svg" 
            alt="PIN" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        );
      default:
        return (
          <Image 
            src="/images/icons/info-circle.svg" 
            alt="Info" 
            width={24} 
            height={24}
            className="w-6 h-6"
          />
        );
    }
  };

  const obtenerColorIcono = (tipo: string, leida: boolean) => {
    if (leida) return "text-gray-400 dark:text-gray-500";
    
    switch (tipo) {
      case "publicacion":
        return "text-blue-500";
      case "envio":
      case "estado_envio":
        return "text-indigo-500";
      case "donacion":
      case "corazon":
        return "text-red-500";
      case "solicitud":
        return "text-purple-500";
      case "pago":
        return "text-green-500";
      case "pin_envio":
        return "text-orange-500";
      default:
        return "text-gray-500";
    }
  };

  const formatearTiempo = (fecha: string) => {
    const ahora = new Date();
    const notifFecha = new Date(fecha);
    const diferencia = Math.floor((ahora.getTime() - notifFecha.getTime()) / 1000);

    if (diferencia < 60) return "Ahora";
    if (diferencia < 3600) return `${Math.floor(diferencia / 60)} min`;
    if (diferencia < 86400) return `${Math.floor(diferencia / 3600)} h`;
    if (diferencia < 604800) return `${Math.floor(diferencia / 86400)} d`;
    
    return notifFecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {noLeidas > 0 && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 flex">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="fixed left-4 right-4 top-18 flex w-auto flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-[20px] sm:w-[380px]"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notificaciones
            </h5>
            {noLeidas > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 rounded-full dark:bg-orange-900/20 dark:text-orange-400">
                {noLeidas}
              </span>
            )}
          </div>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Image 
              src="/images/icons/bell-large.svg" 
              alt="Sin notificaciones" 
              width={64} 
              height={64}
              className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3"
            />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No hay notificaciones
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Las notificaciones aparecerán aquí
            </p>
          </div>
        ) : (
          <>
            <ul className="flex flex-col max-h-[400px] overflow-y-auto custom-scrollbar">
              {notificaciones.map((notif) => (
                <li key={notif.id}>
                  <DropdownItem
                    onItemClick={() => manejarClickNotificacion(notif)}
                    className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                      !notif.leida ? "bg-green-50 dark:bg-green-900/10" : ""
                    }`}
                  >
                    <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notif.leida 
                        ? "bg-gray-100 dark:bg-gray-800" 
                        : "bg-green-100 dark:bg-green-900/20"
                    }`}>
                      <span className={obtenerColorIcono(notif.tipo, notif.leida)}>
                        {obtenerIcono(notif.tipo)}
                      </span>
                    </span>

                    <span className="block flex-1 min-w-0">
                      <span className={`mb-1.5 block text-theme-sm ${
                        notif.leida 
                          ? "text-gray-500 dark:text-gray-400" 
                          : "text-gray-800 dark:text-gray-200 font-medium"
                      }`}>
                        {notif.titulo}
                      </span>

                      <span className="block text-theme-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                        {notif.mensaje}
                      </span>

                      <span className="flex items-center gap-2 text-gray-400 text-theme-xs dark:text-gray-500">
                        <span className="capitalize">{notif.tipo.replace("_", " ")}</span>
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{formatearTiempo(notif.created_at)}</span>
                      </span>
                    </span>

                    {!notif.leida && (
                      <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></span>
                    )}
                  </DropdownItem>
                </li>
              ))}
            </ul>

            {noLeidas > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="block px-4 py-2 mt-3 text-sm font-medium text-center text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
          </>
        )}
      </Dropdown>
    </div>
  );
}

