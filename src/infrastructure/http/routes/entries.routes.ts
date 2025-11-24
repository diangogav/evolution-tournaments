import { Elysia, t } from "elysia";
import { CreateTournamentEntryBody, IdentifierSchema } from "../schemas";
import type { HttpDependencies } from "../types";

export const entriesRoutes = (deps: HttpDependencies) =>
    new Elysia().group("/tournaments/:tournamentId/entries", (app) =>
        app
            .get(
                "/",
                async ({ params }) =>
                    (await (deps.repositories.entries.listByTournament(params.tournamentId))).map(e => e.toPrimitives()),
                {
                    params: t.Object({ tournamentId: IdentifierSchema }),
                    detail: {
                        tags: ['Entries'],
                        summary: 'Listar inscripciones',
                        description: 'Obtiene todas las inscripciones de un torneo'
                    }
                }
            )
            .post(
                "/",
                async ({ params, body, set }) => {
                    const entry = await deps.useCases.registerTournamentEntry.execute({
                        ...body,
                        tournamentId: params.tournamentId,
                    });

                    set.status = 201;
                    return entry.toPrimitives();
                },
                {
                    params: t.Object({ tournamentId: IdentifierSchema }),
                    body: CreateTournamentEntryBody,
                    detail: {
                        tags: ['Entries'],
                        summary: 'Registrar inscripción',
                        description: 'Registra un participante en el torneo'
                    }
                }
            )
            .delete(
                "/:participantId",
                async ({ params, set }) => {
                    await deps.useCases.withdrawTournamentEntry.execute(
                        params.participantId,
                        params.tournamentId
                    );
                    set.status = 201;
                },
                {
                    params: t.Object({
                        tournamentId: IdentifierSchema,
                        participantId: IdentifierSchema,
                    }),
                    detail: {
                        tags: ['Entries'],
                        summary: 'Retirar inscripción',
                        description: 'Retira un participante del torneo'
                    }
                }
            )
            .put(
                "/:participantId/confirm",
                async ({ params, set }) => {
                    await deps.useCases.confirmTournamentEntry.execute(
                        params.participantId,
                        params.tournamentId
                    );
                    set.status = 200;
                    return { message: "Entry confirmed" };
                },
                {
                    params: t.Object({
                        tournamentId: IdentifierSchema,
                        participantId: IdentifierSchema,
                    }),
                    detail: {
                        tags: ['Entries'],
                        summary: 'Confirmar inscripción',
                        description: 'Confirma la inscripción de un participante'
                    }
                }
            )
    );
