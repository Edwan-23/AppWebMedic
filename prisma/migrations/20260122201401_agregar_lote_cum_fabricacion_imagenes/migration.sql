
-- AlterTable
ALTER TABLE "publicaciones" DROP COLUMN "imagen",
ADD COLUMN     "cum" VARCHAR(30) NOT NULL,
ADD COLUMN     "fecha_fabricacion" DATE NOT NULL,
ADD COLUMN     "imagen_invima" TEXT NOT NULL,
ADD COLUMN     "imagen_lote_vencimiento" TEXT NOT NULL,
ADD COLUMN     "imagen_principio_activo" TEXT NOT NULL,
ADD COLUMN     "lote" VARCHAR(50) NOT NULL;
