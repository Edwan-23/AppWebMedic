/*
  Warnings:

  - You are about to drop the column `medicamento_id` on the `donaciones` table. All the data in the column will be lost.
  - You are about to drop the column `medicamento_id` on the `publicaciones` table. All the data in the column will be lost.
  - You are about to drop the column `medicamento_id` on the `solicitudes` table. All the data in the column will be lost.
  - You are about to drop the `medicamentos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `medida_medicamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tipo_medicamento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "donaciones" DROP CONSTRAINT "donaciones_medicamento_fk";

-- DropForeignKey
ALTER TABLE "medicamentos" DROP CONSTRAINT "medicamentos_medida_id_fkey";

-- DropForeignKey
ALTER TABLE "medicamentos" DROP CONSTRAINT "medicamentos_tipo_medicamento_id_fkey";

-- DropForeignKey
ALTER TABLE "publicaciones" DROP CONSTRAINT "publicaciones_medicamento_id_fkey";

-- DropForeignKey
ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_medicamento_id_fkey";

-- AlterTable
ALTER TABLE "donaciones" DROP COLUMN "medicamento_id",
ADD COLUMN     "cantidadcum" VARCHAR(50),
ADD COLUMN     "descripcioncomercial" VARCHAR(255),
ADD COLUMN     "formafarmaceutica" VARCHAR(100),
ADD COLUMN     "principioactivo" VARCHAR(255),
ADD COLUMN     "titular" VARCHAR(255),
ADD COLUMN     "unidadmedida" VARCHAR(50);

-- AlterTable
ALTER TABLE "publicaciones" DROP COLUMN "medicamento_id",
ADD COLUMN     "cantidadcum" VARCHAR(50),
ADD COLUMN     "descripcioncomercial" VARCHAR(255),
ADD COLUMN     "formafarmaceutica" VARCHAR(100),
ADD COLUMN     "principioactivo" VARCHAR(255),
ADD COLUMN     "titular" VARCHAR(255),
ADD COLUMN     "unidadmedida" VARCHAR(50);

-- AlterTable
ALTER TABLE "solicitudes" DROP COLUMN "medicamento_id";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "ultimo_ingreso" TIMESTAMP(6);

-- DropTable
DROP TABLE "medicamentos";

-- DropTable
DROP TABLE "medida_medicamento";

-- DropTable
DROP TABLE "tipo_medicamento";
