# PM2 Configuration Guide

## Instalación
PM2 ya está instalado globalmente en el sistema.

## Comandos Disponibles

### Iniciar la aplicación
```bash
pnpm pm2:start
```
Inicia la aplicación en modo producción usando PM2.

### Detener la aplicación
```bash
pnpm pm2:stop
```
Detiene la aplicación sin eliminarla de PM2.

### Reiniciar la aplicación
```bash
pnpm pm2:restart
```
Reinicia la aplicación (útil después de cambios).

### Eliminar de PM2
```bash
pnpm pm2:delete
```
Elimina completamente la aplicación de PM2.

### Ver logs en tiempo real
```bash
pnpm pm2:logs
```
Muestra los logs de la aplicación en tiempo real.

### Monitoreo
```bash
pnpm pm2:monit
```
Abre el dashboard de monitoreo de PM2.

### Ver estado
```bash
pnpm pm2:status
```
Muestra el estado de todas las aplicaciones PM2.

## Comandos PM2 Directos

### Iniciar aplicación
```bash
pm2 start ecosystem.config.js
```

### Reiniciar con cero downtime
```bash
pm2 reload appweb-hospitales
```

### Guardar configuración
```bash
pm2 save
```

### Configurar inicio automático
```bash
pm2 startup
```
Sigue las instrucciones que PM2 te proporcione.

### Listar aplicaciones
```bash
pm2 list
```

### Información detallada
```bash
pm2 show appweb-hospitales
```

### Limpiar logs
```bash
pm2 flush
```

## Configuración (ecosystem.config.js)

La configuración actual incluye:
- **Nombre**: appweb-hospitales
- **Instancias**: 1 (puede aumentarse para clustering)
- **Auto-restart**: Habilitado
- **Max Memory**: 1GB (se reinicia si excede)
- **Logs**: Guardados en `./logs/`
- **Puerto**: 3000

## Deployment Workflow

1. **Build de producción**:
```bash
pnpm build
```

2. **Iniciar con PM2**:
```bash
pnpm pm2:start
```

3. **Guardar configuración**:
```bash
pm2 save
```

4. **Configurar inicio automático** (opcional):
```bash
pm2 startup
```

5. **Verificar estado**:
```bash
pnpm pm2:status
```

## Logs

Los logs se guardan en:
- Error logs: `./logs/pm2-error.log`
- Output logs: `./logs/pm2-out.log`

## Notas Importantes

- Asegúrate de ejecutar `pnpm build` antes de iniciar con PM2
- PM2 usará el script `pnpm start` que ejecuta Next.js en modo producción
- Para desarrollo, sigue usando `pnpm dev`
- Los logs se mezclan automáticamente (`merge_logs: true`)
