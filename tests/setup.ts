import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { config } from 'dotenv';
import path from 'path';

// Cargar variables de .env (BD de desarrollo)
config({ path: path.resolve(process.cwd(), '.env') });

// MISMA BD que el servidor dev
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  // Setup global antes de todos los tests
  console.log('🧪 Iniciando tests de integración...');
  console.log('📦 Servidor en: http://localhost:3000');
  console.log('📦 Usando BD de desarrollo:', process.env.DATABASE_URL);
});

afterAll(async () => {
  // Cleanup global después de todos los tests
  console.log('✅ Tests completados');
});

afterEach(async () => {
  // Cleanup después de cada test
});
