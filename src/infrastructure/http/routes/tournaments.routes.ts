import { Elysia, t } from "elysia";
import { CreateTournamentBody, IdentifierSchema } from "../schemas";
import type { HttpDependencies } from "../types";

export const tournamentsRoutes = (deps: HttpDependencies) =>
    new Elysia()
        .group("/tournaments", (app) =>
            app
                .get("/", async () => (await deps.repositories.tournaments.list()).map((tournament) => tournament.toPresentation()), {
                    detail: {
                        tags: ['Tournaments'],
                        summary: 'Listar torneos',
                        description: 'Obtiene la lista completa de torneos'
                    }
                })
                .get(
                    "/:tournamentId",
                    async ({ params }) =>
                        (
                            await deps.repositories.tournaments.findById(params.tournamentId)
                        )?.toPresentation(),
                    {
                        params: t.Object({ tournamentId: IdentifierSchema }),
                        detail: {
                            tags: ['Tournaments'],
                            summary: 'Obtener torneo',
                            description: 'Obtiene los detalles de un torneo específico'
                        }
                    }
                )
                .post(
                    "/",
                    async ({ body, set }) => {
                        const tournament = await deps.useCases.createTournament.execute(
                            body
                        );
                        set.status = 201;
                        return tournament.toPrimitives();
                    },
                    {
                        body: CreateTournamentBody,
                        detail: {
                            tags: ['Tournaments'],
                            summary: 'Crear torneo',
                            description: 'Crea un nuevo torneo'
                        }
                    }
                )
                .put(
                    "/:tournamentId/publish",
                    async ({ params, set }) => {
                        await deps.useCases.publishTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament published" };
                    },
                    {
                        params: t.Object({ tournamentId: IdentifierSchema }),
                        detail: {
                            tags: ['Tournaments'],
                            summary: 'Publicar torneo',
                            description: 'Cambia el estado del torneo a publicado'
                        }
                    }
                )
                .put(
                    "/:tournamentId/start",
                    async ({ params, set }) => {
                        await deps.useCases.startTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament started" };
                    },
                    {
                        params: t.Object({ tournamentId: IdentifierSchema }),
                        detail: {
                            tags: ['Tournaments'],
                            summary: 'Iniciar torneo',
                            description: 'Inicia el torneo'
                        }
                    }
                )
                .put(
                    "/:tournamentId/complete",
                    async ({ params, set }) => {
                        await deps.useCases.completeTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament completed" };
                    },
                    {
                        params: t.Object({ tournamentId: IdentifierSchema }),
                        detail: {
                            tags: ['Tournaments'],
                            summary: 'Completar torneo',
                            description: 'Marca el torneo como completado'
                        }
                    }
                )
                .put(
                    "/:tournamentId/cancel",
                    async ({ params, set }) => {
                        await deps.useCases.cancelTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament cancelled" };
                    },
                    {
                        params: t.Object({ tournamentId: IdentifierSchema }),
                        detail: {
                            tags: ['Tournaments'],
                            summary: 'Cancelar torneo',
                            description: 'Cancela el torneo'
                        }
                    }
                )
        );
