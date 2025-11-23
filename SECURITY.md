# Política de Seguridad

## Reporte de Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad en este proyecto, por favor repórtala enviando un correo electrónico a security@evolution.com en lugar de abrir un issue público.

## Medidas de Seguridad Implementadas

### 1. Autenticación y Autorización
- Se recomienda implementar autenticación robusta (JWT, OAuth2) para todos los endpoints sensibles.
- Validar siempre los permisos de usuario antes de procesar solicitudes.

### 2. Protección de Datos
- Todas las comunicaciones deben realizarse sobre HTTPS.
- Las contraseñas y secretos deben almacenarse utilizando algoritmos de hash seguros (e.g., Argon2, bcrypt).
- Las variables de entorno sensibles no deben commitearse al repositorio.

### 3. Seguridad en la API
- **CORS**: Configurado para restringir el acceso a dominios confiables.
- **Headers de Seguridad**: Se implementan headers como `X-Content-Type-Options`, `X-Frame-Options` y `X-XSS-Protection`.
- **Validación de Entrada**: Se utiliza validación estricta de tipos con Elysia y Zod/TypeBox para prevenir inyecciones.

### 4. Infraestructura
- **Docker**: Los contenedores se ejecutan con usuarios no privilegiados.
- **Base de Datos**: Se recomienda el uso de conexiones SSL y redes privadas.
- **Rate Limiting**: Se recomienda configurar rate limiting a nivel de infraestructura (Nginx, Cloudflare) o aplicación.

## Recomendaciones para Producción

1. Mantener las dependencias actualizadas (`bun update`).
2. Escanear regularmente las imágenes de Docker en busca de vulnerabilidades (`docker scan`).
3. Rotar periódicamente las claves de API y secretos.
4. Monitorear los logs en busca de actividad sospechosa.
