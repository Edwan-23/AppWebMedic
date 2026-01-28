
-- DropForeignKey
ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_publicacion_intercambio_id_fkey";

-- AlterTable
ALTER TABLE "solicitudes" DROP COLUMN "descripcion",
DROP COLUMN "publicacion_intercambio_id";
