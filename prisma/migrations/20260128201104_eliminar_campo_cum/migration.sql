
-- AlterTable
ALTER TABLE "donaciones" DROP COLUMN "cum";

-- AlterTable
ALTER TABLE "publicaciones" DROP COLUMN "cum";

-- AlterTable
ALTER TABLE "solicitudes" DROP COLUMN "cantidad_medicamento",
DROP COLUMN "consecutivocum",
DROP COLUMN "expedientecum";
