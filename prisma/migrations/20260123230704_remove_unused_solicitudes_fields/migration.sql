/*
  Warnings:

  - You are about to drop the column `descripcion` on the `solicitudes` table. All the data in the column will be lost.
  - You are about to drop the column `publicacion_intercambio_id` on the `solicitudes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_publicacion_intercambio_id_fkey";

-- AlterTable
ALTER TABLE "solicitudes" DROP COLUMN "descripcion",
DROP COLUMN "publicacion_intercambio_id";
