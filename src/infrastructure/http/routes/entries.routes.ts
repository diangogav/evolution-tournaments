import { Elysia, t } from "elysia";
import { CreateTournamentEntryBody, IdentifierSchema } from "../schemas";
import type { HttpDependencies } from "../types";

export const entriesRoutes = (deps: HttpDependencies) =>
    new Elysia().group("/tournaments/:tournamentId/entries", (app) =>
        app
            .get(
                "/",
                ({ params }) =>
                    deps.repositories.entries.listByTournament(params.tournamentId),
                { params: t.Object({ tournamentId: IdentifierSchema }) }
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
                }
            )
    );
