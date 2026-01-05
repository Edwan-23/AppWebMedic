// Helper para crear notificaciones del sistema

interface CrearNotificacionParams {
  hospital_id: number;
  usuario_id?: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  referencia_id?: number;
  referencia_tipo?: string;
}

export async function crearNotificacion(params: CrearNotificacionParams) {
  try {
    const res = await fetch("/api/notificaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      console.error("Error al crear notificación");
      return null;
    }

    const data = await res.json();
    return data.notificacion;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
