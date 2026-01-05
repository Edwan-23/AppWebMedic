import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";

// GET /api/pagos/[id]/factura - Generar factura PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pagoId = parseInt(id);

    if (isNaN(pagoId)) {
      return NextResponse.json(
        { error: "ID de pago inválido" },
        { status: 400 }
      );
    }

    // Obtener datos del pago con todas las relaciones necesarias
    const pago = await prisma.pagos.findUnique({
      where: { id: BigInt(pagoId) },
      include: {
        medio_pago: true,
        solicitudes: {
          include: {
            publicaciones: {
              include: {
                medicamentos: true,
                hospitales: true
              }
            },
            hospitales: true
          }
        }
      }
    });

    if (!pago) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Crear documento PDF con jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Generar contenido del PDF
    generarFacturaPDF(doc, pago);

    // Obtener el PDF como buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Retornar el PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="factura-${pago.transaccion || pagoId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error al generar factura PDF:", error);
    return NextResponse.json(
      { error: "Error al generar factura" },
      { status: 500 }
    );
  }
}

function generarFacturaPDF(doc: jsPDF, pago: any) {
  const fechaPago = new Date(pago.created_at);
  let y = 20;

  // Encabezado
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURA DE PAGO", 105, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Número de transacción: ${pago.transaccion || "N/A"}`, 105, y, { align: "center" });
  y += 6;
  doc.text(
    `Fecha: ${fechaPago.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
    105,
    y,
    { align: "center" }
  );
  y += 15;

  // Información del Pagador
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL PAGADOR", 20, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${pago.nombre_completo}`, 20, y);
  y += 6;
  doc.text(`Cédula: ${pago.cedula}`, 20, y);
  y += 6;
  doc.text(`Email: ${pago.correo}`, 20, y);
  y += 6;
  doc.text(`Teléfono: ${pago.telefono || "No registrado"}`, 20, y);
  y += 12;

  // Información de la Solicitud
  if (pago.solicitudes) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DE LA SOLICITUD", 20, y);
    y += 8;

    const solicitud = pago.solicitudes;
    const medicamento = solicitud.publicaciones?.medicamentos;
    const hospitalDestino = solicitud.hospitales;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Hospital Solicitante: ${hospitalDestino?.nombre || "N/A"}`, 20, y);
    y += 6;
    doc.text(`Medicamento: ${medicamento?.nombre || "N/A"}`, 20, y);
    y += 6;
    doc.text(
      `Concentración: ${medicamento?.concentracion || 0} ${medicamento?.medida || ""}`,
      20,
      y
    );
    y += 12;
  }

  // Detalles del Pago
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DEL PAGO", 20, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Medio de pago: ${pago.medio_pago?.nombre || "N/A"}`, 20, y);
  y += 6;
  doc.text(`Estado: ${pago.estado}`, 20, y);
  y += 10;

  // Línea separadora
  doc.line(20, y, 190, y);
  y += 10;

  // Total
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PAGADO:", 20, y);
  doc.text(`$${pago.monto.toLocaleString("es-CO")} COP`, 190, y, { align: "right" });
  y += 15;

  // Pie de página
  const footerY = 280;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Este documento es una constancia de pago para medicamentos prioritarios.",
    105,
    footerY,
    { align: "center" }
  );
  doc.text("Sistema de Gestión de Medicamentos - MediFarma", 105, footerY + 5, {
    align: "center",
  });
  doc.text(
    `Generado el: ${pago.updated_at.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })} a las ${pago.updated_at.toLocaleTimeString("es-CO")}`,
    105,
    footerY + 10,
    { align: "center" }
  );
}
