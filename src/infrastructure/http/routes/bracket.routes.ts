import { Elysia, t } from "elysia";
import { IdentifierSchema } from "../schemas";
import type { HttpDependencies } from "../types";

export const bracketRoutes = (deps: HttpDependencies) =>
    new Elysia().group("/tournaments/:tournamentId/bracket", (app) =>
        app.post(
            "/generate",
            async ({ params, set }) => {
                await deps.useCases.generateSingleEliminationBracket.execute({
                    tournamentId: params.tournamentId,
                });

                set.status = 201;
                return { message: "Bracket generated" };
            },
            {
                params: t.Object({ tournamentId: IdentifierSchema }),
                detail: {
                    tags: ['Brackets'],
                    summary: 'Generar bracket',
                    description: 'Genera el bracket de eliminación simple del torneo'
                }
            }
        )
            .post(
                "/generate-full",
                async ({ params, set }) => {
                    await deps.useCases.generateFullBracket.execute({
                        tournamentId: params.tournamentId,
                    });

                    set.status = 201;
                    return { message: "Full bracket generated" };
                },
                {
                    params: t.Object({ tournamentId: IdentifierSchema }),
                    detail: {
                        tags: ['Brackets'],
                        summary: 'Generar bracket completo',
                        description: 'Genera el bracket completo con todos los partidos'
                    }
                }
            )
            .get(
                "/",
                ({ params }) =>
                    deps.useCases.bracketView.execute({
                        tournamentId: params.tournamentId,
                    }),
                {
                    params: t.Object({ tournamentId: IdentifierSchema }),
                    detail: {
                        tags: ['Brackets'],
                        summary: 'Ver bracket',
                        description: 'Obtiene la visualización del bracket del torneo'
                    }
                }
            )
    );
