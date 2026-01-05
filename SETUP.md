# Sistema de Gestión Hospitalaria - Documentación Técnica

## Stack Tecnológico

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Sonner (notificaciones toast)

### Backend
- Node.js (Next.js API Routes)
- Prisma ORM
- Zod (validación de schemas)
- Server-Sent Events (SSE)

### Base de Datos
- PostgreSQL 14+

## Instalación y Configuración

### 1. Dependencias

```bash
pnpm install
```

### 2. Variables de Entorno

```bash
cp .env.example .env
```

Variables requeridas:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
```

### 3. Base de Datos

```bash
pnpm prisma generate
pnpm prisma db push
```

### 4. Lbreria Zod

```bash
pnpm add zod
```

### 5. Servidor de Desarrollo

```bash
pnpm dev
```

**URL:** http://localhost:3000

---

## Arquitectura del Proyecto

```
src/
├── app/
│   ├── (admin)/
│   │   ├── (others-pages)/
│   │   │   ├── (publicaciones)/    # Gestión de publicaciones
│   │   │   ├── (solicitudes)/      # Solicitudes de medicamentos
│   │   │   ├── (logistica)/        # Envíos y tracking
│   │   │   ├── ajustes/            # Configuración del sistema
│   │   │   ├── calendario/
│   │   │   └── profile/
│   │   ├── donaciones/             # Sistema de donaciones
│   │   ├── facturacion/            # Facturas y pagos
│   │   └── pago-prioritario/
│   ├── (auth)/
│   │   ├── signin/
│   │   └── signup/
│   └── api/
│       ├── publicaciones/          # CRUD publicaciones
│       ├── solicitudes/            # CRUD solicitudes
│       ├── donaciones/             # CRUD donaciones
│       ├── envios/                 # Tracking y estados
│       ├── pagos/                  # Procesamiento de pagos
│       ├── facturas/               # Generación de facturas
│       ├── notificaciones/         # Sistema de notificaciones
│       │   └── stream/             # SSE endpoint
│       └── health/                 # Health check
├── components/
│   ├── auth/                       # Formularios de autenticación
│   ├── calendar/                   # Componente calendario
│   ├── common/                     # Utilidades (Modals, Breadcrumb, etc)
│   ├── dashboard/                  # Widgets del dashboard
│   ├── donaciones/                 # Gestión de donaciones
│   ├── facturacion/                # Módulo de facturación
│   ├── form/                       # Inputs, Labels, ImageUpload
│   ├── header/                     # Header con notificaciones
│   ├── logistica/                  # Gestión de envíos
│   ├── publicaciones/              # Gestión de publicaciones
│   ├── solicitudes/                # Gestión de solicitudes
│   ├── ui/                         # Componentes base (Button, Modal, etc)
│   └── user-profile/               # Perfil de usuario
├── context/
│   ├── SidebarContext.tsx          # Estado del sidebar
│   └── ThemeContext.tsx            # Modo claro/oscuro
├── hooks/
│   ├── useGoBack.ts
│   └── useModal.ts
├── icons/                          # Iconos SVG
├── layout/
│   ├── AppHeader.tsx               # Header con notificaciones
│   ├── AppSidebar.tsx              # Navegación lateral
│   └── SidebarWidget.tsx
└── lib/
    └── prisma.ts                   # Cliente Prisma singleton

prisma/
└── schema.prisma                   # Schema de base de datos
```

---

## Arquitectura de Componentes

### Sistema de Notificaciones (SSE)

**Endpoint:** `/api/notificaciones/stream`

**Características:**
- Conexión persistente por hospital
- Heartbeat cada 30 segundos
- Auto-reconexión en frontend
- Broadcast selectivo por `hospital_id`

**Límites:**
- Máximo 20 notificaciones por hospital en BD
- Notificaciones leídas: eliminadas a los 5 días
- Retención máxima: 30 días
- Display frontend: 7 notificaciones

**Tipos de notificaciones:**
- `publicacion`: Nueva publicación disponible
- `solicitud`: Solicitud de medicamento recibida
- `donacion`: Donación recibida
- `envio`: Cambio de estado en envío
- `pin_envio`: PIN de entrega generado
- `pago`: Pago recibido/procesado

### Sistema de Publicaciones

**Flujo:**
1. Hospital publica medicamento
2. Validación de stock disponible
3. Creación de publicación
4. Notificación a todos los hospitales

**Estados:**
- `disponible`: Publicación activa
- `reservado`: Solicitud en proceso
- `finalizado`: Transacción completada

### Sistema de Solicitudes

**Flujo:**
1. Hospital solicita medicamento de publicación
2. Validación de disponibilidad
3. Creación de solicitud
4. Notificación al hospital origen
5. Aprobación/rechazo manual

**Estados:**
- `Pendiente`: En espera de aprobación
- `Aprobada`: Solicitud aceptada
- `Rechazada`: Solicitud denegada

### Sistema de Envíos

**Flujo:**
1. Creación de envío tras aprobación
2. Asignación de transportista
3. Tracking de estados
4. Confirmación con PIN

**Estados del envío:**
- `Pendiente`: Sin asignar
- `En Tránsito`: Envío en camino
- `Distribución`: Llegó al destino (genera PIN)
- `Entregado`: Confirmado con PIN

**Sistema de PIN:**
- Generado al llegar a "Distribución"
- 4 dígitos aleatorios
- Requerido para cambiar a "Entregado"
- Validación en backend

### Sistema de Pagos

**Flujo:**
1. Pago asociado a solicitud aprobada
2. Procesamiento de transacción
3. Actualización de estados
4. Generación de factura

**Estados:**
- `Pendiente`: Sin procesar
- `Completado`: Pago exitoso
- `Rechazado`: Error en transacción

### Sistema de Facturación

**Características:**
- Generación automática post-pago
- Numeración secuencial
- Historial por hospital

---

## API Endpoints

### Publicaciones
```
GET    /api/publicaciones              # Listar con filtros
POST   /api/publicaciones              # Crear publicación
PATCH  /api/publicaciones/[id]         # Actualizar
DELETE /api/publicaciones/[id]         # Eliminar
```

### Solicitudes
```
GET    /api/solicitudes                # Listar
POST   /api/solicitudes                # Crear solicitud
PATCH  /api/solicitudes/[id]/estado    # Aprobar/Rechazar
```

### Envíos
```
GET    /api/envios                     # Listar
POST   /api/envios                     # Crear envío
POST   /api/envios/[id]/cambiar-estado # Cambiar estado + PIN
```

### Notificaciones
```
GET    /api/notificaciones             # Listar (max 7)
GET    /api/notificaciones/stream      # SSE stream
PATCH  /api/notificaciones/[id]        # Marcar como leída
DELETE /api/notificaciones/[id]        # Eliminar
```

### Pagos
```
GET    /api/pagos                      # Historial
POST   /api/pagos/crear-con-solicitud  # Procesar pago
```

### Facturas
```
GET    /api/facturas                   # Listar facturas
```

## Desarrollo

### Crear Nuevo Endpoint

1. Crear archivo en `src/app/api/[ruta]/route.ts`
2. Importar cliente Prisma y Zod
3. Validar con schema Zod
4. Implementar lógica con Prisma
5. Si crea notificaciones, llamar `notificarClientes()`


### Modificar Modelo de BD

```bash
# Editar prisma/schema.prisma
pnpm prisma db push
pnpm prisma generate
```

---

## Configuración de Estilos

### Color Principal

**Actual:** `#348DA6`

**Ubicación:** `src/app/globals.css`


### Clases Tailwind Personalizadas

```css
menu-item-active          # Item activo en sidebar
menu-item-inactive        # Item inactivo
menu-dropdown-item-active # Submenú activo
```

---

### Build
```bash
pnpm install
pnpm prisma generate
pnpm build
pnpm start
```

### Consideraciones SSE
- Configurar timeout en nginx/proxy (>30s)
- Habilitar keep-alive en load balancer
- Monitorear conexiones activas

---

## Scripts Útiles

```bash
pnpm dev                  # Desarrollo
pnpm build                # Build producción
pnpm start                # Ejecutar producción
pnpm lint                 # ESLint
pnpm prisma studio        # GUI base de datos
pnpm prisma db push       # Sincronizar schema sin migración
pnpm prisma generate      # Regenerar cliente
```

---

## Notas Técnicas

### Seguridad
- Validación Zod en todos los endpoints
- Sin exposición de datos de otros hospitales
- Control de stock en publicaciones
- PIN validation en entregas
- Rate limiting en endpoints críticos (pagos, solicitudes)
- Sanitización de inputs en frontend y backend


### Performance
- SSE elimina polling constante (antes 120K req/hora → 0)
- Cliente Prisma singleton
- Limpieza automática de notificaciones antiguas

---

## Health Check

**Endpoint:** `/api/health`

```bash
curl http://localhost:3000/api/health
```
## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Zod](https://zod.dev)
- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)
