-- CreateTable
CREATE TABLE "auditoria_log" (
    "id" BIGSERIAL NOT NULL,
    "accion" VARCHAR(10) NOT NULL,
    "usuario_id" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(60) NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envio" (
    "id" BIGSERIAL NOT NULL,
    "descripcion" TEXT,
    "transporte_id" BIGINT NOT NULL,
    "solicitud_id" BIGINT,
    "fecha_recoleccion" DATE,
    "fecha_entrega_estimada" DATE,
    "estado_envio_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "encargado_logistica_id" BIGINT,
    "pin" VARCHAR(4),

    CONSTRAINT "envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_base" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_envio" (
    "id" BIGSERIAL NOT NULL,
    "guia" VARCHAR(60) NOT NULL,
    "descripcion" TEXT,
    "estado" VARCHAR(20),

    CONSTRAINT "estado_envio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_publicacion" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(10) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "estado_publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitales" (
    "id" BIGSERIAL NOT NULL,
    "rut" VARCHAR(30) NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "direccion" VARCHAR(50) NOT NULL,
    "departamento_id" BIGINT,
    "municipio_id" BIGINT,
    "telefono" VARCHAR(10),
    "celular" VARCHAR(10),
    "correo" VARCHAR(50),
    "estado_id" BIGINT,
    "director" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospitales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "referencia" VARCHAR(60) NOT NULL,
    "tipo_medicamento_id" BIGINT,
    "concentracion" INTEGER NOT NULL,
    "medida_medicamento_id" BIGINT,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medida_medicamento" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(10) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "medida_medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipios" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "departamento_id" BIGINT NOT NULL,
    "estado" INTEGER NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medios_pago" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "icono" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medios_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" BIGSERIAL NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "transaccion" VARCHAR(100),
    "envio_id" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "solicitud_id" BIGINT,
    "nombre_completo" VARCHAR(255) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "cedula" VARCHAR(20) NOT NULL,
    "medio_pago_id" BIGINT,
    "observaciones" TEXT,
    "telefono" VARCHAR(20),

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" BIGSERIAL NOT NULL,
    "hospital_id" BIGINT,
    "medicamento_id" BIGINT,
    "descripcion" TEXT,
    "imagen" TEXT,
    "tipo_publicacion_id" BIGINT,
    "cantidad" INTEGER NOT NULL,
    "fecha_expiracion" DATE NOT NULL,
    "estado_publicacion_id" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "unidad_dispensacion_id" BIGINT,
    "reg_invima" VARCHAR(50) NOT NULL,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "id" BIGSERIAL NOT NULL,
    "descripcion" TEXT,
    "publicacion_id" BIGINT,
    "hospital_id" BIGINT,
    "medicamento_id" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "hospital_origen_id" BIGINT,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_medicamento" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(15) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_publicacion" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(10) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "tipo_publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transporte" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nombres" VARCHAR(50) NOT NULL,
    "apellidos" VARCHAR(50) NOT NULL,
    "sexo" VARCHAR(10),
    "cedula" VARCHAR(20) NOT NULL,
    "correo_corporativo" VARCHAR(50) NOT NULL,
    "celular" VARCHAR(20),
    "numero_tarjeta_profesional" VARCHAR(20),
    "rol_id" BIGINT,
    "hospital_id" BIGINT,
    "estado_base_id" BIGINT,
    "contrasena" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "fecha_nacimiento" DATE,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encargado_logistica" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "apellido" VARCHAR(50) NOT NULL,
    "cedula" INTEGER NOT NULL,
    "correo" VARCHAR(50),
    "celular" VARCHAR(10) NOT NULL,
    "hospital_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "encargado_logistica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" BIGSERIAL NOT NULL,
    "descripcion" TEXT,
    "hospital_id" BIGINT NOT NULL,
    "medicamento_id" BIGINT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "envio_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "imagen" TEXT,
    "unidad_dispensacion_id" BIGINT,
    "hospital_origen_id" BIGINT,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidad_dispensacion" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(30),

    CONSTRAINT "unidades_dispensacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_calendario" (
    "id" BIGSERIAL NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_calendario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos" (
    "id" BIGSERIAL NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "publicado" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencias_accesibilidad" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "contraste_desactivado" BOOLEAN NOT NULL DEFAULT false,
    "contraste_brillante" BOOLEAN NOT NULL DEFAULT false,
    "contraste_invertido" BOOLEAN NOT NULL DEFAULT false,
    "tamano_texto" INTEGER NOT NULL DEFAULT 100,
    "zoom_pantalla" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preferencias_accesibilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" BIGSERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "hospital_id" BIGINT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "referencia_id" BIGINT,
    "referencia_tipo" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estado_base_nombre_key" ON "estado_base"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estado_envio_guia_key" ON "estado_envio"("guia");

-- CreateIndex
CREATE UNIQUE INDEX "estado_publicacion_nombre_key" ON "estado_publicacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "hospitales_rut_key" ON "hospitales"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "medicamentos_referencia_key" ON "medicamentos"("referencia");

-- CreateIndex
CREATE UNIQUE INDEX "medida_medicamento_nombre_key" ON "medida_medicamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "medios_pago_nombre_key" ON "medios_pago"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_transaccion_key" ON "pagos"("transaccion");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_medicamento_nombre_key" ON "tipo_medicamento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_publicacion_nombre_key" ON "tipo_publicacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "transporte_nombre_key" ON "transporte"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cedula_key" ON "usuarios"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_corporativo_key" ON "usuarios"("correo_corporativo");

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_accesibilidad_usuario_id_key" ON "preferencias_accesibilidad"("usuario_id");

-- AddForeignKey
ALTER TABLE "auditoria_log" ADD CONSTRAINT "auditoria_log_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_estado_envio_id_fkey" FOREIGN KEY ("estado_envio_id") REFERENCES "estado_envio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_transporte_id_fkey" FOREIGN KEY ("transporte_id") REFERENCES "transporte"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "fk_envio_encargado_logistica" FOREIGN KEY ("encargado_logistica_id") REFERENCES "encargado_logistica"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hospitales" ADD CONSTRAINT "fk_hospitales_estado" FOREIGN KEY ("estado_id") REFERENCES "estado_base"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hospitales" ADD CONSTRAINT "hospitales_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hospitales" ADD CONSTRAINT "hospitales_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_medida_id_fkey" FOREIGN KEY ("medida_medicamento_id") REFERENCES "medida_medicamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medicamentos" ADD CONSTRAINT "medicamentos_tipo_medicamento_id_fkey" FOREIGN KEY ("tipo_medicamento_id") REFERENCES "tipo_medicamento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "municipios" ADD CONSTRAINT "municipios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "envio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_medio_pago_id_fkey" FOREIGN KEY ("medio_pago_id") REFERENCES "medios_pago"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "fk_publicaciones_unidad_dispensacion" FOREIGN KEY ("unidad_dispensacion_id") REFERENCES "unidad_dispensacion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_estado_publicacion_id_fkey" FOREIGN KEY ("estado_publicacion_id") REFERENCES "estado_publicacion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_tipo_publicacion_id_fkey" FOREIGN KEY ("tipo_publicacion_id") REFERENCES "tipo_publicacion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_hospital_origen_id_fkey" FOREIGN KEY ("hospital_origen_id") REFERENCES "hospitales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_medicamento_id_fkey" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_publicacion_id_fkey" FOREIGN KEY ("publicacion_id") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estado_base_id_fkey" FOREIGN KEY ("estado_base_id") REFERENCES "estado_base"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "encargado_logistica" ADD CONSTRAINT "encargado_logistica_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_envio_fk" FOREIGN KEY ("envio_id") REFERENCES "envio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_hospital_fk" FOREIGN KEY ("hospital_id") REFERENCES "hospitales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_hospital_origen_id_fkey" FOREIGN KEY ("hospital_origen_id") REFERENCES "hospitales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_medicamento_fk" FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "fk_donaciones_unidad_dispensacion" FOREIGN KEY ("unidad_dispensacion_id") REFERENCES "unidad_dispensacion"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventos_calendario" ADD CONSTRAINT "eventos_calendario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avisos" ADD CONSTRAINT "avisos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "preferencias_accesibilidad" ADD CONSTRAINT "preferencias_accesibilidad_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
