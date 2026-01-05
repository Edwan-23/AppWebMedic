# Sistema de Testing

Sistema de pruebas implementado con **Vitest** y **Supertest**.

## Stack de Testing

- **Vitest**: Framework de testing 
- **Supertest**: Testing de API HTTP
- **@testing-library/react**: Testing de componentes React
- **jsdom**: Simulación de DOM para tests

## Estructura de Tests

```
tests/
├── setup.ts                    # Configuración global
├── fixtures/
│   └── data.ts                # Datos de prueba
├── unit/                      # Tests unitarios
│   ├── validations.test.ts   # Validaciones Zod
│   └── utils.test.ts         # Funciones auxiliares
├── integration/               # Tests de integración
│   ├── publicaciones.test.ts # API publicaciones
│   ├── envios.test.ts        # API envíos + PIN
│   └── notificaciones.test.ts # API notificaciones
└── e2e/                       # Tests end-to-end
    └── flujo-completo.test.ts # Flujo completo
```

## Configuración de Base de Datos de Test

### 1. Crear base de datos PostgreSQL de testing

```sql
CREATE DATABASE hospital_test;
```

### 2. Configurar variables de entorno

Copia `.env.test.example` a `.env.test`:

```bash
cp .env.test.example .env.test
```

Edita `.env.test`:

```env
DATABASE_URL_TEST="postgresql://usuario:password@localhost:5432/hospital_test"
NODE_ENV="test"
```

### 3. Sincronizar schema de test

```bash
# Usar DATABASE_URL_TEST para sincronizar
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma db push
```

### 4. Poblar datos básicos (opcional)

Agrega datos mínimos necesarios:
- Hospitales
- Medicamentos
- Tipos de publicación
- Métodos de pago
- Estados de envío
- Transportistas

## Scripts de Testing

```bash
# Ejecutar todos los tests
pnpm test

# Tests unitarios solamente
pnpm test:unit

# Tests de integración
pnpm test:integration

# Tests E2E
pnpm test:e2e

# Watch mode (re-ejecuta en cambios)
pnpm test:watch

# UI interactiva de Vitest
pnpm test:ui

# Coverage (cobertura de código)
pnpm test:coverage
```

## Fase 1: Tests Unitarios 

**Objetivo:** Validar lógica aislada sin dependencias externas

**Archivos:**
- `tests/unit/validations.test.ts`
- `tests/unit/utils.test.ts`

**Qué se prueba:**
- ✅ Validaciones de schemas Zod
- ✅ Generación de PIN (4 dígitos)
- ✅ Funciones de formato (precios, fechas)
- ✅ Cálculos de facturación

**Ejecutar:**
```bash
pnpm test:unit
```
## Fase 2: Tests de Integración 

**Objetivo:** Validar APIs completas con base de datos

**Archivos:**
- `tests/integration/publicaciones.test.ts`
- `tests/integration/envios.test.ts`
- `tests/integration/notificaciones.test.ts`

**Qué se prueba:**
- ✅ CRUD completo de publicaciones
- ✅ Sistema de envíos con estados
- ✅ Generación y validación de PIN
- ✅ Sistema de notificaciones
- ✅ Validación de errores (400, 404, 401)
- ✅ Limpieza automática de notificaciones

**Requisitos:**
- Servidor Next.js corriendo: `pnpm dev`
- Base de datos de test configurada
- Datos básicos en BD (hospitales, medicamentos, etc)

**Ejecutar:**
```bash
# En terminal 1
pnpm dev

# En terminal 2
pnpm test:integration
```

**Características:**
- Medio (requiere BD y servidor)
- Tests reales contra API
- Valida lógica completa de negocio

## Fase 3: Tests E2E 

**Objetivo:** Validar flujos completos de usuario

**Archivos:**
- `tests/e2e/flujo-completo.test.ts`

**Qué se prueba:**
- ✅ Flujo completo: Publicar → Solicitar → Aprobar → Enviar → Entregar → Pagar
- ✅ Generación de PIN en distribución
- ✅ Validación de PIN en entrega
- ✅ Procesamiento de pago completo
- ✅ Creación de notificaciones en cada paso

**Requisitos:**
- Servidor Next.js corriendo
- Base de datos de test con datos básicos
- Al menos 2 hospitales en BD

**Ejecutar:**
```bash
# En terminal 1
pnpm dev

# En terminal 2
pnpm test:e2e
```

## Ejemplo de Output

```bash
✓ tests/unit/validations.test.ts (12 tests) 45ms
✓ tests/unit/utils.test.ts (8 tests) 23ms
✓ tests/integration/publicaciones.test.ts (9 tests) 1.2s
✓ tests/integration/envios.test.ts (11 tests) 1.5s
✓ tests/integration/notificaciones.test.ts (10 tests) 980ms
✓ tests/e2e/flujo-completo.test.ts (9 tests) 2.3s

Test Files  6 passed (6)
     Tests  59 passed (59)
  Start at  10:30:15
  Duration  6.2s
```

## Cobertura de Código

Ejecutar con:
```bash
pnpm test:coverage
```

Genera reporte en:
- `coverage/index.html` (abrir en navegador)
- `coverage/coverage-summary.json`

**Meta de cobertura:**
- Líneas: >80%
- Funciones: >75%
- Branches: >70%

## Buenas Prácticas

### 1. Nombres Descriptivos
```typescript
✅ it('✅ Crea publicación correctamente', ...)
✅ it('❌ Rechaza cantidad negativa', ...)
❌ it('test 1', ...)
```

### 2. Cleanup Después de Tests
```typescript
afterAll(async () => {
  if (testId) {
    await prisma.modelo.delete({ where: { id: BigInt(testId) } });
  }
  await prisma.$disconnect();
});
```

### 3. Validar Tanto Éxito como Error
```typescript
it('✅ Caso exitoso', ...);
it('❌ Error 400', ...);
it('❌ Error 404', ...);
```


### 4. Usar Fixtures
```typescript
import { hospitalTest, medicamentoTest } from '../fixtures/data';
```

## Debugging Tests

### Modo Watch
```bash
pnpm test:watch
```

### UI Interactiva
```bash
pnpm test:ui
```

### Debug Test Específico
```bash
pnpm test tests/integration/publicaciones.test.ts
```

### Logs en Tests
```typescript
console.log(' Setup: Creando datos...');
console.log(` Publicación creada: ID ${id}`);
```

## Troubleshooting

### Error: "Connection refused"
**Problema:** Servidor Next.js no está corriendo  
**Solución:** `pnpm dev` en terminal separada

### Error: "Table does not exist"
**Problema:** Schema no sincronizado en BD de test  
**Solución:** 
```bash
DATABASE_URL=$DATABASE_URL_TEST pnpm prisma db push
```

### Error: "No hospital found"
**Problema:** BD de test vacía  
**Solución:** Agregar datos básicos manualmente o con seed

### Tests muy lentos
**Problema:** Muchos datos en BD de test  
**Solución:** Limpiar BD periódicamente

## Integración con CI/CD

### GitHub Actions (ejemplo)

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: hospital_test
          POSTGRES_PASSWORD: testpass
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
```

## Roadmap de Testing

- [x] Setup Vitest + Supertest
- [x] Tests unitarios (validaciones, utils)
- [x] Tests de integración (CRUD APIs)
- [x] Tests de PIN de envíos
- [x] Tests de notificaciones
- [x] Tests E2E (flujo completo)
- [x] Tests SSE (notificaciones en tiempo real)
- [x] Tests de componentes React
- [x] Tests de facturación con PDF
- [ ] Performance testing

---

**Última actualización:** 26 de diciembre de 2025
