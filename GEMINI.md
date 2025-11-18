# Project Overview

This project is a tournament management system built with a modular architecture. It uses Elysia.js as the web framework and Bun as the runtime. The database can be either PostgreSQL (with Prisma as the ORM) or an in-memory database, which is configurable via the `USE_PRISMA` environment variable.

The project is structured into the following modules:
- `players`: Manages individual players.
- `teams`: Manages teams and team members.
- `participants`: Manages tournament participants, which can be either players or teams.
- `tournaments`: Manages tournaments and tournament entries.
- `groups`: Manages groups within a tournament.
- `matches`: Manages matches between participants.

The architecture follows a clean architecture pattern, with a separation of concerns into `application`, `domain`, and `infrastructure` layers. The `application` layer contains use cases that orchestrate the business logic. The `domain` layer contains the core business logic and entities. The `infrastructure` layer contains the implementation of repositories, services, and the HTTP server.

# Building and Running

## Prerequisites
- Bun
- Node.js and npm (for Prisma)
- Docker (for running a PostgreSQL database)

## Running the application
1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun run dev
   ```
   The server will be running at `http://localhost:3000`.

## Database
The application can be configured to use either a PostgreSQL database or an in-memory database.

### Using PostgreSQL with Prisma
1. Make sure you have a running PostgreSQL instance. You can use the `docker-compose.yaml` file to start one:
   ```bash
   docker-compose up -d
   ```

2. Set the `USE_PRISMA` environment variable to `true`. You can do this by creating a `.env` file with the following content:
   ```
   USE_PRISMA=true
   DATABASE_URL="postgresql://user:password@localhost:5432/tournaments"
   ```

3. Run database migrations:
   ```bash
   bun run migrate:deploy
   ```

4. (Optional) Seed the database with initial data:
   ```bash
   bun run db:seed
   ```

### Using the in-memory database
By default, the application uses an in-memory database. To use it, make sure the `USE_PRISMA` environment variable is not set to `true`.

# Testing

To run the tests, use the following command:
```bash
bun test
```

# Development Conventions

- **Code Style:** The project uses Prettier for code formatting.
- **Testing:** Tests are written with Vitest.
- **Commits:** Commit messages should follow the Conventional Commits specification.
- **Modularity:** The codebase is organized into modules, each with its own `application`, `domain`, and `infrastructure` layers. When adding new features, follow this structure.
- **Repositories:** Each module has a repository that defines the interface for accessing data. The implementation of the repository is located in the `infrastructure` layer.
- **Use Cases:** The business logic is implemented in use cases in the `application` layer. Each use case should have a single responsibility.
- **DTOs:** Data transfer objects (DTOs) are defined in the `application` layer and are used to transfer data between the `infrastructure` and `application` layers.
- **Entities:** The core business objects are defined in the `domain` layer.
