import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const pagoSchema = z.object({
  solicitud_id: z.number(),
  monto: z.number().positive(),
  medio_pago_id: z.number().optional().default(1),
  metodo_pago_id: z.number().optional(), // Alias para medio_pago_id
  nombre_completo: z.string().min(3).optional().default("Test User"),
  correo: z.string().email().optional().default("test@example.com"),
  cedula: z.string().min(5).optional().default("123456789"),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  observaciones: z.string().optional()
});

// POST - Registrar nuevo pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validacion = pagoSchema.safeParse(body);
    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.issues },
        { status: 400 }
      );
    }

    const datos = validacion.data;

    // Usar metodo_pago_id si se proporciona, sino usar medio_pago_id
    const medioPagoId = datos.metodo_pago_id || datos.medio_pago_id;

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitudes.findUnique({
      where: { id: BigInt(datos.solicitud_id) }
    });

    if (!solicitud) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que no exista ya un pago para esta solicitud
    const pagoExistente = await prisma.pagos.findFirst({
      where: { solicitud_id: BigInt(datos.solicitud_id) }
    });

    if (pagoExistente) {
      return NextResponse.json(
        { error: "Ya existe un pago registrado para esta solicitud" },
        { status: 400 }
      );
    }

    // Generar ID de transacción único
    const transaccionId = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Crear el pago con estado "Pendiente"
    const nuevoPago = await prisma.pagos.create({
      data: {
        solicitud_id: BigInt(datos.solicitud_id),
        monto: datos.monto,
        medio_pago_id: BigInt(datos.medio_pago_id),
        nombre_completo: datos.nombre_completo,
        correo: datos.correo,
        cedula: datos.cedula,
        telefono: datos.telefono || null,
        observaciones: datos.observaciones || null,
        transaccion: transaccionId,
        estado: "Pendiente"
      },
      include: {
        medio_pago: true,
        solicitudes: {
          include: {
            medicamentos: true,
            hospitales: true,
            publicaciones: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      mensaje: "Pago registrado exitosamente",
      pago: {
        id: Number(nuevoPago.id),
        transaccion: nuevoPago.transaccion,
        monto: Number(nuevoPago.monto),
        estado: nuevoPago.estado,
        nombre_completo: nuevoPago.nombre_completo,
        correo: nuevoPago.correo,
        medio_pago: {
          id: Number(nuevoPago.medio_pago?.id),
          nombre: nuevoPago.medio_pago?.nombre
        },
        created_at: nuevoPago.created_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error al crear pago:", error);
    return NextResponse.json(
      { error: "Error al procesar el pago" },
      { status: 500 }
    );
  }
}

// GET - Obtener pagos (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hospitalId = searchParams.get("hospital_id");
    const estado = searchParams.get("estado");
    const transaccion = searchParams.get("transaccion");
    const tipo = searchParams.get("tipo"); // "realizados" o "recibidos"
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (hospitalId) {
      // Si tipo es "recibidos", filtrar por publicaciones del hospital actual
      // Si tipo es "realizados" (default), filtrar por solicitudes del hospital actual
      if (tipo === "recibidos") {
        where.solicitudes = {
          publicaciones: {
            hospital_id: BigInt(hospitalId)
          }
        };
      } else {
        where.solicitudes = {
          hospital_id: BigInt(hospitalId)
        };
      }
    }

    if (estado) {
      where.estado = estado;
    }

    if (transaccion) {
      where.transaccion = {
        contains: transaccion,
        mode: 'insensitive'
      };
    }

    // Crear where base para estadísticas (sin paginación ni estado)
    const whereBase: any = {};
    if (hospitalId) {
      if (tipo === "recibidos") {
        whereBase.solicitudes = {
          publicaciones: {
            hospital_id: BigInt(hospitalId)
          }
        };
      } else {
        whereBase.solicitudes = {
          hospital_id: BigInt(hospitalId)
        };
      }
    }

    const [totalRecords, pagos, estadisticas] = await Promise.all([
      prisma.pagos.count({ where }),
      prisma.pagos.findMany({
        where,
        skip,
        take: limit,
        include: {
          medio_pago: true,
          solicitudes: {
            include: {
              medicamentos: {
                include: {
                  tipo_medicamento: true,
                  medida_medicamento: true
                }
              },
              hospitales: true,
              publicaciones: {
                include: {
                  unidad_dispensacion: true
                }
              }
            }
          },
          envio: {
            include: {
              estado_envio: true,
              transporte: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      Promise.all([
        prisma.pagos.count({ where: { ...whereBase, estado: "Pendiente" } }),
        prisma.pagos.count({ where: { ...whereBase, estado: "Completado" } }),
        prisma.pagos.aggregate({
          where: { ...whereBase, estado: "Completado" },
          _sum: { monto: true }
        })
      ])
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return NextResponse.json({
      success: true,
      pagos: pagos.map((p: any) => ({
        id: Number(p.id),
        transaccion: p.transaccion,
        monto: Number(p.monto),
        estado: p.estado,
        nombre: p.nombre_completo,
        email: p.correo,
        cedula: p.cedula,
        telefono: p.telefono,
        observaciones: p.observaciones,
        fecha_pago: p.created_at,
        medio_pago: p.medio_pago ? {
          id: Number(p.medio_pago.id),
          nombre: p.medio_pago.nombre,
          icono: p.medio_pago.icono
        } : null,
        solicitud: p.solicitudes ? {
          id: Number(p.solicitudes.id),
          hospital: p.solicitudes.hospitales?.nombre,
          encargado: p.solicitudes.hospitales?.director,
          cantidad_enviada: Number(p.solicitudes.publicaciones?.cantidad || 0),
          unidad_enviada: p.solicitudes.publicaciones?.unidad_dispensacion?.nombre,
          medicamento: {
            nombre: p.solicitudes.medicamentos?.nombre,
            tipo: p.solicitudes.medicamentos?.tipo_medicamento?.nombre,
            concentracion: p.solicitudes.medicamentos?.concentracion,
            medida: p.solicitudes.medicamentos?.medida_medicamento?.nombre
          }
        } : null,
        envio: p.envio ? {
          id: Number(p.envio.id),
          estado: p.envio.estado_envio?.estado,
          transporte: p.envio.transporte?.nombre,
          fecha_entrega_estimada: p.envio.fecha_entrega_estimada
        } : null
      })),
      estadisticas: {
        pendientes: estadisticas[0],
        completados: estadisticas[1],
        totalRecaudado: Number(estadisticas[2]._sum.monto || 0)
      },
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit
      }
    });

  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}
