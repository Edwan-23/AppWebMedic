import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los medios de pago activos
export async function GET(request: NextRequest) {
  try {
    const mediosPago = await prisma.medios_pago.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json({
      success: true,
      mediosPago: mediosPago.map((m: any) => ({
        id: Number(m.id),
        nombre: m.nombre,
        descripcion: m.descripcion,
        icono: m.icono,
        activo: m.activo
      }))
    });
  } catch (error) {
    console.error("Error al obtener medios de pago:", error);
    return NextResponse.json(
      { error: "Error al obtener medios de pago" },
      { status: 500 }
    );
  }
}

// POST - Crear medios de pago iniciales (solo ejecutar una vez)
export async function POST(request: NextRequest) {
  try {
    const mediosPago = [
      {
        nombre: 'PSE',
        descripcion: 'Débito bancario a través de PSE',
        activo: true,
        icono: 'pse'
      },
      {
        nombre: 'Tarjeta de Crédito',
        descripcion: 'Visa, Mastercard, American Express',
        activo: true,
        icono: 'credit-card'
      },
      {
        nombre: 'Tarjeta de Débito',
        descripcion: 'Tarjetas débito de bancos colombianos',
        activo: true,
        icono: 'debit-card'
      },
      {
        nombre: 'Nequi',
        descripcion: 'Pago a través de la app Nequi',
        activo: true,
        icono: 'nequi'
      },
      {
        nombre: 'Daviplata',
        descripcion: 'Pago a través de la app Daviplata',
        activo: true,
        icono: 'daviplata'
      },
      {
        nombre: 'Transferencia Bancaria',
        descripcion: 'Transferencia directa desde su banco',
        activo: true,
        icono: 'bank-transfer'
      },
      {
        nombre: 'Efectivo',
        descripcion: 'Pago en efectivo contra entrega',
        activo: true,
        icono: 'cash'
      }
    ];

    const creados = [];
    for (const medio of mediosPago) {
      const existe = await prisma.medios_pago.findUnique({
        where: { nombre: medio.nombre }
      });

      if (!existe) {
        const nuevo = await prisma.medios_pago.create({
          data: medio
        });
        creados.push(nuevo.nombre);
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: `Medios de pago creados: ${creados.length}`,
      creados
    }, { status: 201 });
  } catch (error) {
    console.error("Error al crear medios de pago:", error);
    return NextResponse.json(
      { error: "Error al crear medios de pago" },
      { status: 500 }
    );
  }
}
