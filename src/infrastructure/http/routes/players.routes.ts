import { Elysia, t } from "elysia";
import { CreatePlayerBody, IdentifierSchema } from "../schemas";
import type { HttpDependencies } from "../types";

export const playersRoutes = (deps: HttpDependencies) =>
    new Elysia()
        .group("/players", (app) =>
            app
                .get("/", async () =>
                    (await deps.repositories.players.list()).map((p) =>
                        p.toPrimitives()
                    ), {
                    detail: {
                        tags: ['Players'],
                        summary: 'Listar jugadores',
                        description: 'Obtiene la lista completa de jugadores registrados'
                    }
                }
                )
                .get(
                    "/:playerId",
                    async ({ params }) =>
                        (
                            await deps.repositories.players.findById(params.playerId)
                        )?.toPrimitives(),
                    {
                        params: t.Object({ playerId: IdentifierSchema }),
                        detail: {
                            tags: ['Players'],
                            summary: 'Obtener jugador',
                            description: 'Obtiene los detalles de un jugador específico por su ID'
                        }
                    }
                )
                .post(
                    "/",
                    async ({ body, set }) => {
                        const player = await deps.useCases.createPlayer.execute(body);
                        set.status = 201;
                        return player;
                    },
                    {
                        body: CreatePlayerBody,
                        detail: {
                            tags: ['Players'],
                            summary: 'Crear jugador',
                            description: 'Registra un nuevo jugador en el sistema'
                        }
                    }
                )
        );
