
-- AlterTable
ALTER TABLE "solicitudes" DROP COLUMN "estado_solicitud",
DROP COLUMN "tipo_solicitud",
ADD COLUMN     "estado_solicitud_id" BIGINT,
ADD COLUMN     "tipo_solicitud_id" BIGINT;

-- CreateTable
CREATE TABLE "estado_solicitud" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_solicitud" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_solicitud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estado_solicitud_nombre_key" ON "estado_solicitud"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_solicitud_nombre_key" ON "tipo_solicitud"("nombre");

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_tipo_solicitud_id_fkey" FOREIGN KEY ("tipo_solicitud_id") REFERENCES "tipo_solicitud"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_estado_solicitud_id_fkey" FOREIGN KEY ("estado_solicitud_id") REFERENCES "estado_solicitud"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
