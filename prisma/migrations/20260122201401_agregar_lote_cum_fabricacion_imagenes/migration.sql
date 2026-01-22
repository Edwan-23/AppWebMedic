/*
  Warnings:

  - You are about to drop the column `imagen` on the `publicaciones` table. All the data in the column will be lost.
  - Added the required column `cum` to the `publicaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_fabricacion` to the `publicaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagen_invima` to the `publicaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagen_lote_vencimiento` to the `publicaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagen_principio_activo` to the `publicaciones` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lote` to the `publicaciones` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "publicaciones" DROP COLUMN "imagen",
ADD COLUMN     "cum" VARCHAR(30) NOT NULL,
ADD COLUMN     "fecha_fabricacion" DATE NOT NULL,
ADD COLUMN     "imagen_invima" TEXT NOT NULL,
ADD COLUMN     "imagen_lote_vencimiento" TEXT NOT NULL,
ADD COLUMN     "imagen_principio_activo" TEXT NOT NULL,
ADD COLUMN     "lote" VARCHAR(50) NOT NULL;
