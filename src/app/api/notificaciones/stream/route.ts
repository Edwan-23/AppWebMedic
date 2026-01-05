import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Mapa global para mantener conexiones SSE activas
const connections = new Map<string, ReadableStreamDefaultController>();

// GET /api/notificaciones/stream - SSE endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hospitalId = searchParams.get("hospital_id");

  if (!hospitalId) {
    return new Response("hospital_id es requerido", { status: 400 });
  }

  const connectionId = `${hospitalId}-${Date.now()}`;

  const stream = new ReadableStream({
    start(controller) {
      // Guardar la conexión
      connections.set(connectionId, controller);

      // Enviar mensaje inicial
      controller.enqueue(`data: ${JSON.stringify({ type: "connected", connectionId })}\n\n`);

      // Heartbeat cada 30 segundos para mantener conexión viva
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`);
        } catch (error) {
          clearInterval(heartbeatInterval);
          connections.delete(connectionId);
        }
      }, 30000);

      // Limpiar al cerrar conexión
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        connections.delete(connectionId);
        try {
          controller.close();
        } catch (error) {
          // Conexión ya cerrada
        }
      });
    },
    cancel() {
      connections.delete(connectionId);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no" // Para nginx
    }
  });
}

// Función helper para enviar notificación a conexiones específicas
export async function notificarClientes(hospitalId: bigint, notificacion: any) {
  const hospitalIdStr = hospitalId.toString();
  
  // Buscar todas las conexiones del hospital
  for (const [connectionId, controller] of connections.entries()) {
    if (connectionId.startsWith(hospitalIdStr)) {
      try {
        const message = `data: ${JSON.stringify({
          type: "nueva_notificacion",
          notificacion
        })}\n\n`;
        controller.enqueue(message);
      } catch (error) {
        // Conexión cerrada, eliminar
        connections.delete(connectionId);
      }
    }
  }
}
