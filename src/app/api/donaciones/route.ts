import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notificarClientes } from "../notificaciones/stream/route";

// Schema de validación
const donacionSchema = z.object({
  medicamento_id: z.number(),
  hospital_origen_id: z.number(),
  hospital_destino_id: z.number(),
  cantidad: z.number().positive(),
  unidad_dispensacion_id: z.number(),
  descripcion: z.string().optional(),
  imagen: z.string().optional()
});

// GET - Obtener donaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const estado = searchParams.get("estado") || "";
    const tipo = searchParams.get("tipo") || ""; // "enviadas" o "recibidas"
    const hospitalId = searchParams.get("hospital_id") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const whereCondition: any = {};

    // Filtro por tipo de donación (enviadas/recibidas)
    if (tipo && hospitalId) {
      if (tipo === "enviadas") {
        // Donaciones donde el hospital es el origen (donante)
        whereCondition.hospital_origen_id = parseInt(hospitalId);
      } else if (tipo === "recibidas") {
        // Donaciones donde el hospital es el destino (receptor)
        whereCondition.hospital_id = parseInt(hospitalId);
      }
    }

    // Filtro por estado
    if (estado === "pendiente") {
      whereCondition.envio_id = null;
    } else if (estado === "proceso") {
      // En proceso: tiene envío pero NO está entregado
      whereCondition.envio_id = { not: null };
      whereCondition.envio = {
        estado_envio: {
          estado: { not: "Entregado" }
        }
      };
    } else if (estado === "completada") {
      whereCondition.envio = {
        estado_envio: {
          estado: "Entregado"
        }
      };
    }

    // Búsqueda por medicamento
    if (search) {
      whereCondition.medicamentos = {
        nombre: {
          contains: search,
          mode: "insensitive"
        }
      };
    }

    // Calcular paginación
    const skip = (page - 1) * limit;
    const totalRecords = await prisma.donaciones.count({ where: whereCondition });
    const totalPages = Math.ceil(totalRecords / limit);

    const donaciones = await prisma.donaciones.findMany({
      where: whereCondition,
      skip,
      take: limit,
      include: {
        medicamentos: {
          select: {
            id: true,
            nombre: true,
            referencia: true
          }
        },
        hospitales: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            municipios: {
              select: {
                nombre: true
              }
            }
          }
        },
        hospital_origen: {
          select: {
            id: true,
            nombre: true,
            direccion: true,
            municipios: {
              select: {
                nombre: true
              }
            }
          }
        },
        unidad_dispensacion: {
          select: {
            id: true,
            nombre: true
          }
        },
        envio: {
          select: {
            id: true,
            estado_envio: {
              select: {
                estado: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: "desc"
      }
    });

    // Serializar BigInt a Number
    const donacionesSerializables = donaciones.map((donacion: any) => ({
      id: Number(donacion.id),
      descripcion: donacion.descripcion,
      cantidad: donacion.cantidad,
      created_at: donacion.created_at ? donacion.created_at.toISOString() : new Date().toISOString(),
      updated_at: donacion.updated_at?.toISOString() || null,
      imagen: donacion.imagen,
      hospital_id: Number(donacion.hospital_id),
      hospital_origen_id: donacion.hospital_origen_id ? Number(donacion.hospital_origen_id) : null,
      medicamento_id: Number(donacion.medicamento_id),
      envio_id: donacion.envio_id ? Number(donacion.envio_id) : null,
      unidad_dispensacion_id: donacion.unidad_dispensacion_id ? Number(donacion.unidad_dispensacion_id) : null,
      medicamentos: donacion.medicamentos ? {
        id: Number(donacion.medicamentos.id),
        nombre: donacion.medicamentos.nombre,
        referencia: donacion.medicamentos.referencia
      } : null,
      hospitales: donacion.hospitales ? {
        id: Number(donacion.hospitales.id),
        nombre: donacion.hospitales.nombre,
        direccion: donacion.hospitales.direccion,
        municipios: donacion.hospitales.municipios ? {
          nombre: donacion.hospitales.municipios.nombre
        } : null
      } : null,
      hospital_origen: donacion.hospital_origen ? {
        id: Number(donacion.hospital_origen.id),
        nombre: donacion.hospital_origen.nombre,
        direccion: donacion.hospital_origen.direccion,
        municipios: donacion.hospital_origen.municipios ? {
          nombre: donacion.hospital_origen.municipios.nombre
        } : null
      } : null,
      unidad_dispensacion: donacion.unidad_dispensacion ? {
        id: Number(donacion.unidad_dispensacion.id),
        nombre: donacion.unidad_dispensacion.nombre
      } : null,
      envio: donacion.envio ? {
        id: Number(donacion.envio.id),
        estado_envio: donacion.envio.estado_envio
      } : null
    }));

    return NextResponse.json({ 
      donaciones: donacionesSerializables,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit
      }
    });
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener donaciones" },
      { status: 500 }
    );
  }
}

// POST - Crear donación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = donacionSchema.parse(body);

    // Crear donación
    const nuevaDonacion = await prisma.donaciones.create({
      data: {
        medicamento_id: BigInt(validatedData.medicamento_id),
        hospital_id: BigInt(validatedData.hospital_destino_id),
        hospital_origen_id: BigInt(validatedData.hospital_origen_id),
        cantidad: validatedData.cantidad,
        unidad_dispensacion_id: BigInt(validatedData.unidad_dispensacion_id),
        descripcion: validatedData.descripcion || null,
        imagen: validatedData.imagen || null,
        envio_id: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        medicamentos: true,
        hospitales: true,
        unidad_dispensacion: true
      }
    });

    // Crear notificación para el hospital receptor de la donación
    try {
      const medicamento = nuevaDonacion.medicamentos?.nombre || "medicamento";
      const hospitalOrigen = await prisma.hospitales.findUnique({
        where: { id: BigInt(validatedData.hospital_origen_id) }
      });

      const nuevaNotificacion = await prisma.notificaciones.create({
        data: {
          titulo: "Nueva donación recibida",
          mensaje: `${hospitalOrigen?.nombre || "Un hospital"} te ha donado ${validatedData.cantidad} unidades de ${medicamento}`,
          tipo: "donacion",
          hospital_id: BigInt(validatedData.hospital_destino_id),
          referencia_id: nuevaDonacion.id,
          referencia_tipo: "donacion"
        }
      });
      
      await notificarClientes(BigInt(validatedData.hospital_destino_id), {
        id: Number(nuevaNotificacion.id),
        titulo: nuevaNotificacion.titulo,
        mensaje: nuevaNotificacion.mensaje,
        tipo: nuevaNotificacion.tipo,
        hospital_id: validatedData.hospital_destino_id,
        usuario_id: null,
        leida: false,
        referencia_id: Number(nuevaDonacion.id),
        referencia_tipo: "donacion",
        created_at: nuevaNotificacion.created_at
      });
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError);
    }

    return NextResponse.json({
      message: "Donación creada exitosamente",
      donacion: {
        id: Number(nuevaDonacion.id),
        medicamento_id: Number(nuevaDonacion.medicamento_id),
        hospital_id: Number(nuevaDonacion.hospital_id),
        hospital_origen_id: nuevaDonacion.hospital_origen_id ? Number(nuevaDonacion.hospital_origen_id) : null,
        cantidad: nuevaDonacion.cantidad,
        unidad_dispensacion_id: nuevaDonacion.unidad_dispensacion_id ? Number(nuevaDonacion.unidad_dispensacion_id) : null,
        descripcion: nuevaDonacion.descripcion,
        imagen: nuevaDonacion.imagen,
        created_at: nuevaDonacion.created_at.toISOString(),
        updated_at: nuevaDonacion.updated_at.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error al crear donación:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al crear donación" },
      { status: 500 }
    );
  }
}
