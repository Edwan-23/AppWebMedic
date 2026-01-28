import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notificarClientes } from "../../../notificaciones/stream/route";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { hospital_id } = body;

    if (!hospital_id) {
      return NextResponse.json(
        { error: "hospital_id es requerido" },
        { status: 400 }
      );
    }

    const donacionId = BigInt(id);

    // Verificar que la donación existe y está disponible
    const donacion = await prisma.donaciones.findUnique({
      where: { id: donacionId },
      include: {
        hospitales: true,
        estado_donacion: true
      }
    });

    if (!donacion) {
      return NextResponse.json(
        { error: "Donación no encontrada" },
        { status: 404 }
      );
    }

    if (donacion.estado_donacion?.nombre !== "Disponible") {
      return NextResponse.json(
        { error: "Esta donación ya no está disponible" },
        { status: 400 }
      );
    }

    // Verificar que no es el mismo hospital donante
    if (Number(donacion.hospital_id) === parseInt(hospital_id)) {
      return NextResponse.json(
        { error: "No puedes solicitar tu propia donación" },
        { status: 400 }
      );
    }

    // Buscar estado "Solicitado"
    const estadoSolicitado = await prisma.estado_donacion.findUnique({
      where: { nombre: "Solicitado" }
    });

    if (!estadoSolicitado) {
      return NextResponse.json(
        { error: "Estado 'Solicitado' no encontrado" },
        { status: 500 }
      );
    }

    // Actualizar la donación: cambiar estado y asignar hospital_origen_id
    const donacionActualizada = await prisma.donaciones.update({
      where: { id: donacionId },
      data: {
        estado_donacion_id: estadoSolicitado.id,
        hospital_origen_id: BigInt(hospital_id)
      },
      include: {
        hospitales: true,
        hospital_origen: true,
        estado_donacion: true
      }
    });

    // Crear notificación para el hospital donante
    try {
      const medicamento = donacion.principioactivo || "Medicamento";
      const hospitalSolicitante = await prisma.hospitales.findUnique({
        where: { id: BigInt(hospital_id) },
        select: { nombre: true }
      });

      const notificacion = await prisma.notificaciones.create({
        data: {
          titulo: "Donación solicitada",
          mensaje: `${hospitalSolicitante?.nombre} ha solicitado tu donación de ${medicamento}`,
          tipo: "donacion",
          hospital_id: donacion.hospital_id,
          referencia_id: donacionId,
          referencia_tipo: "donacion"
        }
      });

      // Enviar notificación en tiempo real
      await notificarClientes(donacion.hospital_id, {
        id: Number(notificacion.id),
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        tipo: notificacion.tipo,
        hospital_id: Number(notificacion.hospital_id),
        usuario_id: null,
        leida: false,
        referencia_id: Number(donacionId),
        referencia_tipo: "donacion",
        created_at: notificacion.created_at
      });
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError);
    }

    return NextResponse.json({
      success: true,
      message: "Donación solicitada exitosamente",
      donacion: {
        id: Number(donacionActualizada.id),
        estado: donacionActualizada.estado_donacion?.nombre,
        hospital_donante: donacionActualizada.hospitales?.nombre,
        hospital_receptor: donacionActualizada.hospital_origen?.nombre
      }
    });

  } catch (error) {
    console.error("Error al solicitar donación:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
