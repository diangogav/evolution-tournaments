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
                .put(
                    "/:tournamentId/publish",
                    async ({ params, set }) => {
                        await deps.useCases.publishTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament published" };
                    },
                    { params: t.Object({ tournamentId: IdentifierSchema }) }
                )
                .put(
                    "/:tournamentId/start",
                    async ({ params, set }) => {
                        await deps.useCases.startTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament started" };
                    },
                    { params: t.Object({ tournamentId: IdentifierSchema }) }
                )
                .put(
                    "/:tournamentId/complete",
                    async ({ params, set }) => {
                        await deps.useCases.completeTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament completed" };
                    },
                    { params: t.Object({ tournamentId: IdentifierSchema }) }
                )
                .put(
                    "/:tournamentId/cancel",
                    async ({ params, set }) => {
                        await deps.useCases.cancelTournament.execute(params.tournamentId);
                        set.status = 200;
                        return { message: "Tournament cancelled" };
                    },
                    { params: t.Object({ tournamentId: IdentifierSchema }) }
                )
        );
