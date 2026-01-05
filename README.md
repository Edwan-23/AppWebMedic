# Sistema de Gestión Hospitalaria

Aplicación web orientada a hospitales que permite publicar, solicitar y gestionar medicamentos próximos a vencerse, integrando logística, donaciones y facturación.

## Estado del Proyecto

Este proyecto se encuentra en fase MVP, con los módulos principales funcionales y en proceso de mejoras continuas.

## Desarrollo

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Node.js (API Routes), Prisma ORM
- **Base de datos:** PostgreSQL
- **Real-time:** Server-Sent Events (SSE)
- **Validación:** Zod
- **Notificaciones:** Sonner

## Requisitos

- Node.js >= 18.18 (recomendado 20+)
- PostgreSQL 14+
- pnpm >= 9


## Instalación

```bash
# Clonar repositorio
git clone <repository-url>

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Configurar base de datos
pnpm prisma generate
pnpm prisma db push

# Instalar libreria de validación Zod
pnpm add zod

# Iniciar servidor de desarrollo
pnpm dev
```

## Funcionalidades

### Gestión de Medicamentos
- Publicación de medicamentos disponibles 
- Solicitudes entre hospitales
- Sistema de donaciones
- Control de inventario con validación de stock

### Logística y Envíos
- Tracking de envíos en tiempo real
- Estados: Pendiente → En Tránsito → Distribución → Entregado
- Sistema de PIN para confirmación de entregas
- Gestión de transportistas

### Pagos y Facturación
- Procesamiento de transacciones
- Historial de pagos por hospital
- Estados: Pendiente, Completado, Rechazado

### Notificaciones en Tiempo Real
- Server-Sent Events (SSE) para notificaciones push
- Tipos: Publicaciones, Solicitudes, Envíos, Donaciones, Pagos
- Limpieza automática: notificaciones leídas eliminadas a los 5 días

### Administración
- Gestión de usuarios y hospitales
- Configuración de medicamentos
- Control de acceso por roles
- Sistema de avisos globales

## Scripts

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build para producción
pnpm start            # Ejecutar en producción
pnpm lint             # Linter
pnpm prisma studio    # Visualizar base de datos
```

## Documentación

- [SETUP.md](SETUP.md) - Configuración detallada del proyecto

## Licencia

Este proyecto está bajo la licencia MIT.



