-- Step 1: Crear las nuevas tablas
CREATE TABLE "tipo_solicitud" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_solicitud_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tipo_solicitud_nombre_key" ON "tipo_solicitud"("nombre");

CREATE TABLE "estado_solicitud" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_solicitud_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "estado_solicitud_nombre_key" ON "estado_solicitud"("nombre");

-- Step 2: Insertar los valores de catálogo
INSERT INTO "tipo_solicitud" ("nombre", "descripcion") VALUES
('compra', 'Solicitud de compra de medicamentos'),
('intercambio', 'Solicitud de intercambio de medicamentos'),
('prestamo', 'Solicitud de préstamo de medicamentos');

INSERT INTO "estado_solicitud" ("nombre", "descripcion") VALUES
('pendiente', 'Solicitud pendiente de respuesta'),
('aceptada', 'Solicitud aceptada y aprobada'),
('rechazada', 'Solicitud rechazada');

-- Step 3: Agregar las nuevas columnas FK a solicitudes (permite null temporalmente)
ALTER TABLE "solicitudes" ADD COLUMN "tipo_solicitud_id" BIGINT;
ALTER TABLE "solicitudes" ADD COLUMN "estado_solicitud_id" BIGINT;

-- Step 4: Migrar los datos existentes
UPDATE "solicitudes" SET "tipo_solicitud_id" = (SELECT id FROM "tipo_solicitud" WHERE nombre = "solicitudes"."tipo_solicitud");
UPDATE "solicitudes" SET "estado_solicitud_id" = (SELECT id FROM "estado_solicitud" WHERE nombre = "solicitudes"."estado_solicitud");

-- Step 5: Eliminar las columnas antiguas
ALTER TABLE "solicitudes" DROP COLUMN "tipo_solicitud";
ALTER TABLE "solicitudes" DROP COLUMN "estado_solicitud";

-- Step 6: Agregar las foreign keys
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_tipo_solicitud_id_fkey" FOREIGN KEY ("tipo_solicitud_id") REFERENCES "tipo_solicitud"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_estado_solicitud_id_fkey" FOREIGN KEY ("estado_solicitud_id") REFERENCES "estado_solicitud"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
