import { Elysia, t } from "elysia";
import {
    CreateMatchBody,
    RecordMatchResultBody,
    EditMatchResultBody,
    IdentifierSchema,
} from "../schemas";
import type { HttpDependencies } from "../types";

export const matchesRoutes = (deps: HttpDependencies) =>
    new Elysia().group("/tournaments/:tournamentId/matches", (app) =>
        app
            .get(
                "/",
                async ({ params }) =>
                    (
                        await deps.useCases.listMatchesByTournament.execute({
                            tournamentId: params.tournamentId,
                        })
                    ).map((m) => m.toPrimitives()),
                {
                    params: t.Object({ tournamentId: IdentifierSchema }),
                    detail: {
                        tags: ['Matches'],
                        summary: 'Listar partidos',
                        description: 'Obtiene todos los partidos de un torneo'
                    }
                }
            )

            .post(
                "/",
                ({ params, body, set }) => {
                    set.status = 201;
                    return deps.useCases.createMatch.execute({
                        ...body,
                        tournamentId: params.tournamentId,
                        participants: [{
                            participantId: body.participants[0].participantId,
                            score: 0,
                            result: null
                        }, {
                            participantId: body.participants[1].participantId,
                            score: 0,
                            result: null
                        }],
                    });
                },
                {
                    params: t.Object({ tournamentId: IdentifierSchema }),
                    body: CreateMatchBody,
                    detail: {
                        tags: ['Matches'],
                        summary: 'Crear partido',
                        description: 'Crea un nuevo partido en el torneo'
                    }
                }
            )

            .post(
                "/:matchId/result",
                async ({ params, body, set }) => {
                    await deps.useCases.recordMatchResult.execute({
                        matchId: params.matchId,
                        participants: [{
                            participantId: body.participants[0].participantId,
                            score: body.participants[0].score,
                        }, {
                            participantId: body.participants[1].participantId,
                            score: body.participants[1].score,
                        }],
                    });

                    set.status = 200;
                    return { message: "Result saved" };
                },
                {
                    params: t.Object({
                        tournamentId: IdentifierSchema,
                        matchId: IdentifierSchema,
                    }),
                    body: RecordMatchResultBody,
                    detail: {
                        tags: ['Matches'],
                        summary: 'Registrar resultado',
                        description: 'Registra el resultado de un partido'
                    }
                }
            )
            .put(
                "/:matchId/result",
                async ({ params, body, set }) => {
                    await deps.useCases.editMatchResult.execute(
                        params.matchId,
                        [{
                            participantId: body.participants[0].participantId,
                            score: body.participants[0].score,
                            result: body.participants[0].result ?? null
                        }, {
                            participantId: body.participants[1].participantId,
                            score: body.participants[1].score,
                            result: body.participants[1].result ?? null
                        }]
                    );

                    set.status = 200;
                    return { message: "Result updated" };
                },
                {
                    params: t.Object({
                        tournamentId: IdentifierSchema,
                        matchId: IdentifierSchema,
                    }),
                    body: EditMatchResultBody,
                    detail: {
                        tags: ['Matches'],
                        summary: 'Editar resultado',
                        description: 'Edita el resultado de un partido'
                    }
                }
            )
            .delete(
                "/:matchId/result",
                async ({ params, set }) => {
                    await deps.useCases.annullMatchResult.execute(params.matchId);
                    set.status = 204;
                },
                {
                    params: t.Object({
                        tournamentId: IdentifierSchema,
                        matchId: IdentifierSchema,
                    }),
                    detail: {
                        tags: ['Matches'],
                        summary: 'Anular resultado',
                        description: 'Anula el resultado de un partido'
                    }
                }
            )
    );
