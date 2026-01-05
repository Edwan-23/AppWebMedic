import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateMedicamentoSchema = z.object({
  nombre: z.string().min(1).max(50).optional(),
  referencia: z.string().min(1).max(60).optional(),
  concentracion: z.number().int().positive().optional(),
  descripcion: z.string().optional().nullable(),
  tipo_medicamento_id: z.string().optional().nullable(),
  medida_medicamento_id: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const medicamentoId = BigInt(id);

    const medicamento = await (prisma as any).medicamentos.findUnique({
      where: { id: medicamentoId },
    });

    if (!medicamento) {
      return NextResponse.json(
        { error: "Medicamento no encontrado" },
        { status: 404 }
      );
    }

    const medicamentoFormateado = {
      ...medicamento,
      id: medicamento.id.toString(),
      tipo_medicamento_id: medicamento.tipo_medicamento_id?.toString() || null,
      medida_medicamento_id: medicamento.medida_medicamento_id?.toString() || null,
    };

    return NextResponse.json(medicamentoFormateado);
  } catch (error) {
    console.error("Error al obtener medicamento:", error);
    return NextResponse.json(
      { error: "Error al obtener medicamento" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const medicamentoId = BigInt(id);
    const body = await request.json();

    // Validar con Zod
    const validacion = updateMedicamentoSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        { 
          error: "Datos inválidos",
          detalles: validacion.error.issues
        },
        { status: 400 }
      );
    }

    const datos = validacion.data;

    // Verificar si el medicamento existe
    const medicamentoExistente = await (prisma as any).medicamentos.findUnique({
      where: { id: medicamentoId },
    });

    if (!medicamentoExistente) {
      return NextResponse.json(
        { error: "Medicamento no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si la referencia ya existe en otro medicamento
    if (datos.referencia && datos.referencia !== medicamentoExistente.referencia) {
      const referenciaExistente = await (prisma as any).medicamentos.findUnique({
        where: { referencia: datos.referencia },
      });

      if (referenciaExistente) {
        return NextResponse.json(
          { error: "La referencia ya está registrada" },
          { status: 400 }
        );
      }
    }

    // Preparar datos para actualizar
    const datosActualizar: any = {};
    
    if (datos.nombre) datosActualizar.nombre = datos.nombre;
    if (datos.referencia) datosActualizar.referencia = datos.referencia;
    if (datos.concentracion) datosActualizar.concentracion = datos.concentracion;
    if (datos.descripcion !== undefined) datosActualizar.descripcion = datos.descripcion;
    if (datos.tipo_medicamento_id !== undefined) {
      datosActualizar.tipo_medicamento_id = datos.tipo_medicamento_id ? BigInt(datos.tipo_medicamento_id) : null;
    }
    if (datos.medida_medicamento_id !== undefined) {
      datosActualizar.medida_medicamento_id = datos.medida_medicamento_id ? BigInt(datos.medida_medicamento_id) : null;
    }

    datosActualizar.updated_at = new Date();

    // Actualizar medicamento
    const medicamentoActualizado = await (prisma as any).medicamentos.update({
      where: { id: medicamentoId },
      data: datosActualizar,
    });

    const medicamentoFormateado = {
      ...medicamentoActualizado,
      id: medicamentoActualizado.id.toString(),
      tipo_medicamento_id: medicamentoActualizado.tipo_medicamento_id?.toString() || null,
      medida_medicamento_id: medicamentoActualizado.medida_medicamento_id?.toString() || null,
    };

    return NextResponse.json(
      { 
        mensaje: "Medicamento actualizado exitosamente",
        medicamento: medicamentoFormateado
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al actualizar medicamento:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const medicamentoId = BigInt(id);

    // Verificar si el medicamento existe
    const medicamento = await (prisma as any).medicamentos.findUnique({
      where: { id: medicamentoId },
    });

    if (!medicamento) {
      return NextResponse.json(
        { error: "Medicamento no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar medicamento
    await (prisma as any).medicamentos.delete({
      where: { id: medicamentoId },
    });

    return NextResponse.json({ 
      mensaje: "Medicamento eliminado exitosamente" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error al eliminar medicamento:", error);
    
    // Error de clave foránea
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "No se puede eliminar el medicamento porque tiene registros asociados" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
