import { Elysia, t } from "elysia";
import {
    CreateMatchBody,
    RecordMatchResultBody,
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
                { params: t.Object({ tournamentId: IdentifierSchema }) }
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
                        }, {
                            participantId: body.participants[1].participantId,
                        }],
                    });
                },
                {
                    params: t.Object({ tournamentId: IdentifierSchema }),
                    body: CreateMatchBody,
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
                }
            )
    );
