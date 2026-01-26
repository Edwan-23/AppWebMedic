/*
  Warnings:

  - You are about to drop the column `tipo_envio` on the `solicitudes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "solicitudes" DROP COLUMN "tipo_envio",
ADD COLUMN     "tipo_envio_id" BIGINT;

-- CreateTable
CREATE TABLE "tipo_envio" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_envio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_envio_nombre_key" ON "tipo_envio"("nombre");

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_tipo_envio_id_fkey" FOREIGN KEY ("tipo_envio_id") REFERENCES "tipo_envio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Insertar tipos de envío
INSERT INTO "tipo_envio" ("nombre", "descripcion") VALUES
('Estándar', 'Envío estándar sin costo, coordinación directa entre hospitales'),
('Prioritario', 'Envío prioritario con seguimiento en tiempo real y transporte especializado');
