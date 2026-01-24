-- DropForeignKey
ALTER TABLE "solicitudes" DROP CONSTRAINT "solicitudes_publicacion_id_fkey";

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
