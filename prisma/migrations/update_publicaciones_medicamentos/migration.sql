-- Migration: Actualizar campos de medicamentos en publicaciones
-- Agregar expedientecum, consecutivocum y cantidad_medicamento

-- Agregar los nuevos campos
ALTER TABLE publicaciones 
ADD COLUMN IF NOT EXISTS expedientecum VARCHAR(50),
ADD COLUMN IF NOT EXISTS consecutivocum VARCHAR(50),
ADD COLUMN IF NOT EXISTS cantidad_medicamento VARCHAR(50);

-- Agregar los mismos campos a solicitudes
ALTER TABLE solicitudes
ADD COLUMN IF NOT EXISTS expedientecum VARCHAR(50),
ADD COLUMN IF NOT EXISTS consecutivocum VARCHAR(50),
ADD COLUMN IF NOT EXISTS cantidad_medicamento VARCHAR(50);
