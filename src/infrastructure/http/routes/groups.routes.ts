import { Elysia } from "elysia";
import { CreateGroupBody } from "../schemas";
import type { HttpDependencies } from "../types";

export const groupsRoutes = (deps: HttpDependencies) =>
    new Elysia()
        .group("/groups", (app) =>
            app
                .get("/", () => deps.repositories.groups.list(), {
                    detail: {
                        tags: ['Groups'],
                        summary: 'Listar grupos',
                        description: 'Obtiene la lista completa de grupos'
                    }
                })
                .post("/", ({ body, set }) => {
                    set.status = 201;
                    return deps.useCases.createGroup.execute(body);
                }, {
                    body: CreateGroupBody,
                    detail: {
                        tags: ['Groups'],
                        summary: 'Crear grupo',
                        description: 'Crea un nuevo grupo en el torneo'
                    }
                })
        );
