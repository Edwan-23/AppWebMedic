import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const actualizarHospitalSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  direccion: z.string().min(5, "La dirección debe tener al menos 5 caracteres").optional(),
  telefono: z.string().regex(/^\d{7,10}$/, "El teléfono debe tener entre 7 y 10 dígitos").optional(),
  celular: z.string().regex(/^\d{10}$/, "El celular debe tener exactamente 10 dígitos").optional(),
  correo: z.string().email("Ingrese un correo electrónico válido").optional(),
  director: z.string().min(3, "El nombre del director debe tener al menos 3 caracteres").optional(),
  departamento_id: z.string().optional(),
  municipio_id: z.string().optional()
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const hospitalId = BigInt(id);

    const hospital = await (prisma as any).hospitales.findUnique({
      where: { id: hospitalId },
      select: {
        id: true,
        rut: true,
        nombre: true,
        direccion: true,
        departamento_id: true,
        municipio_id: true,
        telefono: true,
        celular: true,
        correo: true,
        estado_id: true,
        director: true,
        created_at: true,
        updated_at: true,
        departamentos: {
          select: { id: true, nombre: true }
        },
        municipios: {
          select: { id: true, nombre: true }
        },
        estado_base: {
          select: { id: true, nombre: true }
        }
      }
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital no encontrado" },
        { status: 404 }
      );
    }

    // Convertir BigInt a string
    const hospitalData = {
      id: hospital.id.toString(),
      rut: hospital.rut,
      nombre: hospital.nombre,
      direccion: hospital.direccion,
      departamento_id: hospital.departamento_id?.toString(),
      municipio_id: hospital.municipio_id?.toString(),
      telefono: hospital.telefono,
      celular: hospital.celular,
      correo: hospital.correo,
      estado_id: hospital.estado_id?.toString(),
      director: hospital.director,
      created_at: hospital.created_at,
      updated_at: hospital.updated_at,
      departamentos: hospital.departamentos ? {
        id: hospital.departamentos.id.toString(),
        nombre: hospital.departamentos.nombre
      } : null,
      municipios: hospital.municipios ? {
        id: hospital.municipios.id.toString(),
        nombre: hospital.municipios.nombre
      } : null,
      estado_base: hospital.estado_base ? {
        id: hospital.estado_base.id.toString(),
        nombre: hospital.estado_base.nombre
      } : null,
    };

    return NextResponse.json(hospitalData, { status: 200 });

  } catch (error) {
    console.error("Error al obtener hospital:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
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
    const hospitalId = BigInt(id);
    const body = await request.json();

    // Validar con Zod
    const validacion = actualizarHospitalSchema.safeParse(body);

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

    // Convertir IDs a BigInt si existen
    const datosActualizar: any = {};
    
    if (datos.nombre) datosActualizar.nombre = datos.nombre;
    if (datos.direccion) datosActualizar.direccion = datos.direccion;
    if (datos.telefono) datosActualizar.telefono = datos.telefono;
    if (datos.celular) datosActualizar.celular = datos.celular;
    if (datos.correo) datosActualizar.correo = datos.correo;
    if (datos.director) datosActualizar.director = datos.director;
    if (datos.departamento_id) datosActualizar.departamento_id = BigInt(datos.departamento_id);
    if (datos.municipio_id) datosActualizar.municipio_id = BigInt(datos.municipio_id);

    // Actualizar hospital
    const hospitalActualizado = await (prisma as any).hospitales.update({
      where: { id: hospitalId },
      data: datosActualizar,
      include: {
        departamentos: {
          select: { id: true, nombre: true }
        },
        municipios: {
          select: { id: true, nombre: true }
        },
        estado_base: {
          select: { id: true, nombre: true }
        }
      }
    });

    // Convertir BigInt a string
    const hospitalData = {
      id: hospitalActualizado.id.toString(),
      rut: hospitalActualizado.rut,
      nombre: hospitalActualizado.nombre,
      direccion: hospitalActualizado.direccion,
      departamento_id: hospitalActualizado.departamento_id?.toString(),
      municipio_id: hospitalActualizado.municipio_id?.toString(),
      telefono: hospitalActualizado.telefono,
      celular: hospitalActualizado.celular,
      correo: hospitalActualizado.correo,
      estado_id: hospitalActualizado.estado_id?.toString(),
      director: hospitalActualizado.director,
      created_at: hospitalActualizado.created_at,
      updated_at: hospitalActualizado.updated_at,
      departamentos: hospitalActualizado.departamentos ? {
        id: hospitalActualizado.departamentos.id.toString(),
        nombre: hospitalActualizado.departamentos.nombre
      } : null,
      municipios: hospitalActualizado.municipios ? {
        id: hospitalActualizado.municipios.id.toString(),
        nombre: hospitalActualizado.municipios.nombre
      } : null,
      estado_base: hospitalActualizado.estado_base ? {
        id: hospitalActualizado.estado_base.id.toString(),
        nombre: hospitalActualizado.estado_base.nombre
      } : null,
    };

    return NextResponse.json(
      { 
        mensaje: "Hospital actualizado exitosamente",
        hospital: hospitalData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al actualizar hospital:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const hospitalId = BigInt(id);
    const body = await request.json();

    // Validar que se envíe estado_id
    if (!body.estado_id) {
      return NextResponse.json(
        { error: "estado_id es requerido" },
        { status: 400 }
      );
    }

    const estadoId = BigInt(body.estado_id);

    // Verificar si el hospital existe
    const hospital = await (prisma as any).hospitales.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar estado del hospital
    const hospitalActualizado = await (prisma as any).hospitales.update({
      where: { id: hospitalId },
      data: {
        estado_id: estadoId,
      },
      include: {
        estado_base: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        mensaje: "Estado del hospital actualizado correctamente",
        hospital: {
          id: hospitalActualizado.id.toString(),
          estado_id: hospitalActualizado.estado_id.toString(),
          estado_base: {
            id: hospitalActualizado.estado_base.id.toString(),
            nombre: hospitalActualizado.estado_base.nombre,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar estado del hospital:", error);
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
    const hospitalId = BigInt(id);

    // Verificar si el hospital existe
    const hospital = await (prisma as any).hospitales.findUnique({
      where: { id: hospitalId },
    });

    if (!hospital) {
      return NextResponse.json(
        { error: "Hospital no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar hospital
    await (prisma as any).hospitales.delete({
      where: { id: hospitalId },
    });

    return NextResponse.json({ 
      mensaje: "Hospital eliminado exitosamente" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error al eliminar hospital:", error);
    
    // Error de clave foránea
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "No se puede eliminar el hospital porque tiene registros asociados" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
