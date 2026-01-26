import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "@/app/api/notificaciones/stream/route";

// Obtener hora actual en zona horaria de Bogotá
function obtenerHoraBogota() {
  const ahora = new Date();
  const fechaBogota = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
  return fechaBogota;
}

// Generar PIN aleatorio de 4 dígitos
function generarPIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// POST /api/envios/[id]/cambiar-estado
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { nuevoEstadoNombre, pin } = await request.json();
    const { id } = await params;
    const envioId = parseInt(id);

    if (isNaN(envioId)) {
      return NextResponse.json(
        { error: "ID de envío inválido" },
        { status: 400 }
      );
    }

    if (!nuevoEstadoNombre) {
      return NextResponse.json(
        { error: "Estado requerido" },
        { status: 400 }
      );
    }

    // Obtener el envío actual
    const envioActual = await prisma.envio.findUnique({
      where: { id: BigInt(envioId) },
      include: {
        estado_envio: true,
        solicitudes: {
          include: {
            hospitales: true,
            hospital_origen: true
          }
        }
      }
    });

    if (!envioActual) {
      return NextResponse.json(
        { error: "Envío no encontrado" },
        { status: 404 }
      );
    }

    // Obtener el nuevo estado (búsqueda case-insensitive)
    console.log("Buscando estado:", nuevoEstadoNombre);
    
    const todosLosEstados = await prisma.estado_envio.findMany();
    console.log("Estados disponibles:", todosLosEstados.map((e: any) => e.estado));
    
    const nuevoEstado = todosLosEstados.find(
      (e: any) => e.estado?.toLowerCase().trim() === nuevoEstadoNombre.toLowerCase().trim()
    );

    if (!nuevoEstado) {
      return NextResponse.json(
        { 
          error: "Estado no válido", 
          estadoBuscado: nuevoEstadoNombre,
          estadosDisponibles: todosLosEstados.map((e: any) => e.estado)
        },
        { status: 400 }
      );
    }
    
    console.log("Estado encontrado:", nuevoEstado);

    let pinGenerado: string | null = null;

    // Si el nuevo estado es "Distribución", generar el PIN
    if (nuevoEstadoNombre.toLowerCase() === "distribución") {
      pinGenerado = generarPIN();
    }

    // Si el nuevo estado es "Entregado", validar el PIN
    if (nuevoEstadoNombre.toLowerCase() === "entregado") {
      if (!pin) {
        return NextResponse.json(
          { error: "PIN requerido para confirmar entrega" },
          { status: 400 }
        );
      }

      if (!envioActual.pin) {
        return NextResponse.json(
          { error: "No se encontró PIN para este envío" },
          { status: 400 }
        );
      }

      // Validar el PIN directamente
      if (pin !== envioActual.pin) {
        return NextResponse.json(
          { error: "PIN incorrecto" },
          { status: 401 }
        );
      }
    }

    // Actualizar el estado del envío
    const envioActualizado = await prisma.envio.update({
      where: { id: BigInt(envioId) },
      data: {
        estado_envio_id: nuevoEstado.id,
        // Guardar PIN si se generó, o borrarlo si se entregó
        pin: pinGenerado || (nuevoEstadoNombre.toLowerCase() === "entregado" ? null : undefined),
        updated_at: obtenerHoraBogota()
      },
      include: {
        estado_envio: true,
        solicitudes: {
          include: {
            hospitales: true,
            hospital_origen: true,
            publicaciones: {
              include: {
                hospitales: true,
                unidad_dispensacion: true
              }
            }
          }
        },
        transporte: true,
        encargado_logistica: true,
        donaciones: {
          include: {
            hospitales: true,
            hospital_origen: true,
            unidad_dispensacion: true
          }
        }
      }
    });

    // Crear notificaciones automáticas según el estado
    try {
      const medicamento = envioActualizado.solicitudes?.publicaciones?.principioactivo || 
                         (envioActualizado.donaciones && envioActualizado.donaciones.length > 0 
                           ? envioActualizado.donaciones[0].principioactivo 
                           : "medicamento");

      // Notificar al hospital que RECIBE sobre cambios de estado
      let hospitalReceptor: number | null = null;
      if (envioActualizado.solicitudes) {
        hospitalReceptor = Number(envioActualizado.solicitudes.hospital_id);
      } else if (envioActualizado.donaciones && envioActualizado.donaciones.length > 0) {
        hospitalReceptor = Number(envioActualizado.donaciones[0].hospital_id);
      }

      if (hospitalReceptor) {
        let titulo = "";
        let mensaje = "";
        let tipo = "estado_envio";

        if (nuevoEstadoNombre.toLowerCase() === "en tránsito") {
          titulo = "Envío en camino";
          mensaje = `El envío de ${medicamento} está en tránsito hacia tu hospital`;
        } else if (nuevoEstadoNombre.toLowerCase() === "distribución") {
          titulo = "PIN de entrega generado";
          mensaje = `El envío de ${medicamento} llegó a distribución. Revisa el PIN para confirmar la entrega`;
          tipo = "pin_envio";
        } else if (nuevoEstadoNombre.toLowerCase() === "entregado") {
          titulo = "Envío entregado";
          mensaje = `El envío de ${medicamento} ha sido entregado correctamente`;
        }

        if (titulo) {
          const nuevaNotificacion = await prisma.notificaciones.create({
            data: {
              titulo,
              mensaje,
              tipo,
              hospital_id: BigInt(hospitalReceptor),
              referencia_id: BigInt(envioId),
              referencia_tipo: "envio"
            }
          });
          
          // Notificar en tiempo real vía SSE
          await notificarClientes(BigInt(hospitalReceptor), {
            id: Number(nuevaNotificacion.id),
            titulo: nuevaNotificacion.titulo,
            mensaje: nuevaNotificacion.mensaje,
            tipo: nuevaNotificacion.tipo,
            hospital_id: hospitalReceptor,
            leida: false,
            referencia_id: envioId,
            referencia_tipo: "envio",
            created_at: nuevaNotificacion.created_at
          });
        }
      }
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError);
    }

    // Convertir BigInt a string para JSON usando JSON.parse(JSON.stringify con replacer)
    const envioConvertido = JSON.parse(
      JSON.stringify(envioActualizado, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    return NextResponse.json({
      message: "Estado actualizado correctamente",
      envio: envioConvertido,
      ...(pinGenerado && { pin: pinGenerado }) // Solo devolver el PIN si se generó (para mostrarlo al receptor)
    });

  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return NextResponse.json(
      { error: "Error al cambiar el estado del envío" },
      { status: 500 }
    );
  }
}
