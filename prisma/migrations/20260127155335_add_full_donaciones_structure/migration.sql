/*
  Warnings:

  - You are about to drop the column `imagen` on the `donaciones` table. All the data in the column will be lost.
  - Added the required column `cum` to the `donaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_expiracion` to the `donaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_fabricacion` to the `donaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagen_invima` to the `donaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagen_lote_vencimiento` to the `donaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagen_principio_activo` to the `donaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lote` to the `donaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reg_invima` to the `donaciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "donaciones" DROP COLUMN "imagen",
ADD COLUMN     "cum" VARCHAR(30) NOT NULL,
ADD COLUMN     "estado_donacion_id" BIGINT,
ADD COLUMN     "fecha_expiracion" DATE NOT NULL,
ADD COLUMN     "fecha_fabricacion" DATE NOT NULL,
ADD COLUMN     "imagen_invima" TEXT NOT NULL,
ADD COLUMN     "imagen_lote_vencimiento" TEXT NOT NULL,
ADD COLUMN     "imagen_principio_activo" TEXT NOT NULL,
ADD COLUMN     "lote" VARCHAR(50) NOT NULL,
ADD COLUMN     "reg_invima" VARCHAR(50) NOT NULL,
ADD COLUMN     "tipo_donacion_id" BIGINT;

-- CreateTable
CREATE TABLE "estado_donacion" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_donacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_donacion" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_donacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estado_donacion_nombre_key" ON "estado_donacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_donacion_nombre_key" ON "tipo_donacion"("nombre");

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_estado_donacion_id_fkey" FOREIGN KEY ("estado_donacion_id") REFERENCES "estado_donacion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_tipo_donacion_id_fkey" FOREIGN KEY ("tipo_donacion_id") REFERENCES "tipo_donacion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
