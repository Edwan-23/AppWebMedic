import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación para crear medicamento
const createMedicamentoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(50),
  referencia: z.string().min(1, "La referencia es requerida").max(60),
  concentracion: z.number().int().positive("La concentración debe ser un número positivo"),
  descripcion: z.string().optional().nullable(),
  tipo_medicamento_id: z.string().optional().nullable(),
  medida_medicamento_id: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { referencia: { contains: search, mode: 'insensitive' } }
      ];
    }

    const medicamentos = await (prisma as any).medicamentos.findMany({
      where,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        nombre: true,
        referencia: true,
        concentracion: true,
        descripcion: true,
        tipo_medicamento_id: true,
        medida_medicamento_id: true,
        created_at: true,
        tipo_medicamento: {
          select: { id: true, nombre: true }
        },
        medida_medicamento: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Convertir BigInt a string
    const medicamentosData = medicamentos.map((med: any) => ({
      id: med.id.toString(),
      nombre: med.nombre,
      referencia: med.referencia,
      tipo_medicamento_id: med.tipo_medicamento_id?.toString(),
      concentracion: med.concentracion,
      medida_medicamento_id: med.medida_medicamento_id?.toString(),
      descripcion: med.descripcion,
      created_at: med.created_at,
      tipo_medicamento: med.tipo_medicamento ? {
        id: med.tipo_medicamento.id.toString(),
        nombre: med.tipo_medicamento.nombre
      } : null,
      medida_medicamento: med.medida_medicamento ? {
        id: med.medida_medicamento.id.toString(),
        nombre: med.medida_medicamento.nombre
      } : null
    }));

    const total = medicamentosData.length;

    return NextResponse.json({
      medicamentos: medicamentosData,
      total,
    });
  } catch (error) {
    console.error("Error al obtener medicamentos:", error);
    return NextResponse.json(
      { error: "Error al obtener medicamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar datos
    const validacion = createMedicamentoSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: validacion.error.issues[0].message },
        { status: 400 }
      );
    }

    const { nombre, referencia, concentracion, descripcion, tipo_medicamento_id, medida_medicamento_id } = validacion.data;

    // Verificar si la referencia ya existe
    const referenciaExistente = await (prisma as any).medicamentos.findUnique({
      where: { referencia },
    });

    if (referenciaExistente) {
      return NextResponse.json(
        { error: "La referencia ya está registrada" },
        { status: 400 }
      );
    }

    // Crear medicamento
    const medicamento = await (prisma as any).medicamentos.create({
      data: {
        nombre,
        referencia,
        concentracion,
        descripcion: descripcion || null,
        tipo_medicamento_id: tipo_medicamento_id ? BigInt(tipo_medicamento_id) : null,
        medida_medicamento_id: medida_medicamento_id ? BigInt(medida_medicamento_id) : null,
      },
    });

    const medicamentoFormateado = {
      ...medicamento,
      id: medicamento.id.toString(),
      tipo_medicamento_id: medicamento.tipo_medicamento_id?.toString() || null,
      medida_medicamento_id: medicamento.medida_medicamento_id?.toString() || null,
    };

    return NextResponse.json(medicamentoFormateado, { status: 201 });
  } catch (error) {
    console.error("Error al crear medicamento:", error);
    return NextResponse.json(
      { error: "Error al crear medicamento" },
      { status: 500 }
    );
  }
}
