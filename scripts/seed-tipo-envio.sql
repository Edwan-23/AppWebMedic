-- Insertar tipos de envío
INSERT INTO "tipo_envio" ("nombre", "descripcion") 
VALUES
  ('Estándar', 'Envío estándar sin costo, coordinación directa entre hospitales'),
  ('Prioritario', 'Envío prioritario con seguimiento en tiempo real y transporte especializado')
ON CONFLICT (nombre) DO NOTHING;
