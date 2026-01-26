import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const pagoId = BigInt(id);

    const { envio_id } = body;

    if (!envio_id) {
      return NextResponse.json(
        { error: "envio_id es requerido" },
        { status: 400 }
      );
    }

    // Actualizar el pago con el envío vinculado
    const pagoActualizado = await prisma.pagos.update({
      where: { id: pagoId },
      data: {
        envio_id: BigInt(envio_id),
        updated_at: new Date()
      },
      include: {
        solicitudes: true,
        medio_pago: true
      }
    });

    return NextResponse.json({
      success: true,
      mensaje: "Pago vinculado al envío exitosamente",
      pago: {
        id: Number(pagoActualizado.id),
        envio_id: Number(pagoActualizado.envio_id),
        transaccion: pagoActualizado.transaccion
      }
    });

  } catch (error: any) {
    console.error("Error al vincular pago con envío:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al vincular el pago con el envío" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const pagoId = BigInt(id);

    const { estado } = body;

    if (!estado || !["Pendiente", "Completado", "Fallido"].includes(estado)) {
      return NextResponse.json(
        { error: "Estado inválido. Debe ser: Pendiente, Completado o Fallido" },
        { status: 400 }
      );
    }

    // Actualizar estado del pago
    const pagoActualizado = await prisma.pagos.update({
      where: { id: pagoId },
      data: {
        estado,
        updated_at: new Date()
      },
      include: {
        solicitudes: true,
        medio_pago: true
      }
    });

    // Si el pago se marca como "Completado", crear el envío prioritario
    if (estado === "Completado" && pagoActualizado.solicitud_id && !pagoActualizado.envio_id) {
      // Obtener la solicitud con la publicación para conocer el hospital origen
      const solicitud = await prisma.solicitudes.findUnique({
        where: { id: pagoActualizado.solicitud_id },
        include: {
          publicaciones: {
            select: { hospital_id: true }
          }
        }
      });

      // Obtener estado "Empaquetando"
      const estadoInicial = await prisma.estado_envio.findFirst({
        where: { estado: "Empaquetando" }
      });

      if (estadoInicial && solicitud) {
        // Obtener un transporte por defecto (Pendiente por validar)
        const transporte = await prisma.transporte.findFirst();

        if (transporte) {
          // Crear envío prioritario
          const nuevoEnvio = await prisma.envio.create({
            data: {
              solicitud_id: pagoActualizado.solicitud_id,
              transporte_id: transporte.id,
              estado_envio_id: estadoInicial.id,
              descripcion: `Envío prioritario - Pago ${pagoActualizado.transaccion}`,
              fecha_recoleccion: new Date(),
              fecha_entrega_estimada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // +2 días
            }
          });

          // Actualizar el pago con el envío creado
          await prisma.pagos.update({
            where: { id: pagoId },
            data: { envio_id: nuevoEnvio.id }
          });

          // Actualizar la solicitud solo con hospital_origen_id
          await prisma.solicitudes.update({
            where: { id: pagoActualizado.solicitud_id },
            data: { 
              hospital_origen_id: solicitud.publicaciones?.hospital_id || null
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: `Pago actualizado a estado: ${estado}`,
      pago: {
        id: Number(pagoActualizado.id),
        estado: pagoActualizado.estado,
        transaccion: pagoActualizado.transaccion
      }
    });

  } catch (error: any) {
    console.error("Error al actualizar pago:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar el pago" },
      { status: 500 }
    );
  }
}
