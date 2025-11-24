# Evolution Tournaments API

Sistema de gestión de torneos construido con arquitectura limpia, utilizando Elysia.js como framework web y Bun como runtime.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura limpia modular con separación de responsabilidades:

```
src/
├── modules/
│   ├── players/          # Gestión de jugadores individuales
│   ├── teams/            # Gestión de equipos y miembros
│   ├── participants/     # Gestión de participantes (jugadores o equipos)
│   ├── tournaments/      # Gestión de torneos y brackets
│   ├── groups/           # Gestión de grupos dentro de torneos
│   ├── matches/          # Gestión de partidos
│   └── shared/           # Utilidades compartidas
└── infrastructure/       # HTTP, persistencia y servicios externos
```

Cada módulo contiene:
- **application**: Casos de uso que orquestan la lógica de negocio
- **domain**: Entidades y lógica de negocio central
- **infrastructure**: Implementación de repositorios y servicios

## 🚀 Inicio Rápido

### Prerrequisitos

- [Bun](https://bun.sh) v1.0 o superior
- Docker y Docker Compose (opcional, para base de datos)
- PostgreSQL 16+ (si no usas Docker)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd tournaments

# Instalar dependencias
bun install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
```

### Configuración de Base de Datos

#### Opción 1: Usar Docker Compose (Recomendado)

```bash
# Iniciar PostgreSQL
docker compose up postgres -d

# Ejecutar migraciones
bun run migrate:deploy

# (Opcional) Poblar con datos de ejemplo
bun run db:seed
```

#### Opción 2: PostgreSQL Local

Configura tu `DATABASE_URL` en `.env`:
```bash
DATABASE_URL="postgresql://usuario:password@localhost:5432/tournaments?schema=public"
```

Luego ejecuta las migraciones:
```bash
bun run migrate:deploy
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
bun run dev
```

El servidor estará disponible en `http://localhost:3000`

### Documentación de la API (Swagger)

Una vez que el servidor esté corriendo, puedes acceder a la documentación interactiva de la API en:

```
http://localhost:3000/swagger
```

Swagger UI te permite:
- 📖 Ver todos los endpoints disponibles
- 🧪 Probar las APIs directamente desde el navegador
- 📋 Ver los esquemas de request/response
- 🏷️ Navegar por categorías (Players, Teams, Tournaments, etc.)

## 🐳 Docker

### Desarrollo con Docker Compose

```bash
# Iniciar todos los servicios (app + PostgreSQL)
docker compose up

# Reconstruir la imagen de la app
docker compose up --build

# Detener servicios
docker compose down
```

### Producción con Docker

```bash
# Usar docker-compose.prod.yaml
docker compose -f docker-compose.prod.yaml up -d

# Ver logs
docker compose -f docker-compose.prod.yaml logs -f app
```

### Construir imagen Docker manualmente

```bash
# Construir imagen
docker build -t tournaments:latest .

# Ejecutar contenedor
docker run --env-file .env -p 3000:3000 tournaments:latest
```

## 🧪 Testing

```bash
# Ejecutar tests E2E
bun run test:e2e

# Ejecutar tests con UI
bun run test:e2e --ui

# Ejecutar tests con coverage
bun run test:e2e --coverage
```

Los tests utilizan [Testcontainers](https://testcontainers.com/) para crear instancias aisladas de PostgreSQL.

## 📊 Base de Datos

### Migraciones

```bash
# Aplicar migraciones en producción
bun run migrate:deploy

# Generar cliente de Prisma
bun run prisma:generate

# Ver estado de migraciones
bunx prisma migrate status
```

### Esquema

El proyecto utiliza Prisma como ORM. El esquema se encuentra en `prisma/schema.prisma` e incluye:

- **Players**: Jugadores individuales
- **Teams**: Equipos con múltiples miembros
- **Participants**: Abstracción de jugadores o equipos
- **Tournaments**: Torneos con diferentes formatos
- **TournamentEntries**: Inscripciones a torneos
- **Groups**: Grupos dentro de torneos
- **Matches**: Partidos entre participantes


## 🛠️ Stack Tecnológico

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Elysia.js](https://elysiajs.com)
- **ORM**: [Prisma](https://www.prisma.io)
- **Base de Datos**: PostgreSQL 16
- **Testing**: [Vitest](https://vitest.dev) + [Testcontainers](https://testcontainers.com/)
- **Logging**: [Pino](https://getpino.io)

## 📦 Scripts Disponibles

```bash
bun run dev              # Servidor de desarrollo con hot reload
bun run test:e2e         # Ejecutar tests E2E
bun run migrate:deploy   # Aplicar migraciones de Prisma
bun run prisma:generate  # Generar cliente de Prisma
bun run db:seed          # Poblar base de datos con datos de ejemplo
```

## 🌍 Variables de Entorno

```bash
# Base de Datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/tournaments?schema=public"
POSTGRES_DB=tournaments
POSTGRES_USER=usuario
POSTGRES_PASSWORD=password

# Aplicación
NODE_ENV=development
PORT=3000
```


## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🔗 Enlaces Útiles

- [Documentación de Bun](https://bun.sh/docs)
- [Documentación de Elysia](https://elysiajs.com)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Guía de Arquitectura Limpia](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)