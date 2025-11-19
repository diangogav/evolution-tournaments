import { Elysia, t } from "elysia";
import {
    CreateTeamBody,
    AddTeamMemberBody,
    IdentifierSchema,
} from "../schemas";
import type { HttpDependencies } from "../types";

export const teamsRoutes = (deps: HttpDependencies) =>
    new Elysia().group("/teams", (app) =>
        app
            // Listar equipos
            .get("/", () => deps.repositories.teams.list())

            // Obtener equipo por ID
            .get(
                "/:teamId",
                async ({ params, set }) => {
                    const team = await deps.repositories.teams.findById(params.teamId);

                    if (!team) {
                        set.status = 404;
                        return { message: "Team not found" };
                    }

                    return team;
                },
                { params: t.Object({ teamId: IdentifierSchema }) }
            )

            // Crear equipo
            .post(
                "/",
                async ({ body, set }) => {
                    const team = await deps.useCases.createTeam.execute(body);
                    set.status = 201;
                    return team;
                },
                { body: CreateTeamBody }
            )

            // Agregar miembro a un equipo
            .post(
                "/:teamId/members",
                async ({ params, body, set }) => {
                    const member = await deps.useCases.addTeamMember.execute({
                        ...body,
                        teamId: params.teamId,
                    });

                    set.status = 201;
                    return member;
                },
                {
                    params: t.Object({ teamId: IdentifierSchema }),
                    body: AddTeamMemberBody,
                }
            )
    );
