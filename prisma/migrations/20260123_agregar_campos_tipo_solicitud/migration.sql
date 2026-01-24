-- AlterTable
ALTER TABLE "solicitudes" ADD COLUMN "tipo_solicitud" VARCHAR(20),
ADD COLUMN "valor_propuesto" DECIMAL(10,2),
ADD COLUMN "publicacion_intercambio_id" BIGINT,
ADD COLUMN "fecha_devolucion_estimada" DATE,
ADD COLUMN "propuesta_descripcion" TEXT,
ADD COLUMN "estado_solicitud" VARCHAR(20) DEFAULT 'pendiente';

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_publicacion_intercambio_id_fkey" FOREIGN KEY ("publicacion_intercambio_id") REFERENCES "publicaciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
