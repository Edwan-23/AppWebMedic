
-- AlterTable (con IF EXISTS para evitar errores)
ALTER TABLE "publicaciones" DROP COLUMN IF EXISTS "cantidadcum";
ALTER TABLE "solicitudes" DROP COLUMN IF EXISTS "cantidadcum";
