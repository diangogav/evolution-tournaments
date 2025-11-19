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
            { params: t.Object({ tournamentId: IdentifierSchema }) }
        )
    );
