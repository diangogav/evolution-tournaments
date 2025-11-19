import { Elysia, t } from "elysia";
import { CreateTournamentBody, IdentifierSchema } from "../schemas";
import type { HttpDependencies } from "../types";

export const tournamentsRoutes = (deps: HttpDependencies) =>
    new Elysia()
        .group("/tournaments", (app) =>
            app
                .get("/", () => deps.repositories.tournaments.list())
                .get(
                    "/:tournamentId",
                    async ({ params }) =>
                        (
                            await deps.repositories.tournaments.findById(params.tournamentId)
                        )?.toPrimitives(),
                    { params: t.Object({ tournamentId: IdentifierSchema }) }
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
                    { body: CreateTournamentBody }
                )
        );
