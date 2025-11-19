import { Elysia } from "elysia";
import { CreateGroupBody } from "../schemas";
import type { HttpDependencies } from "../types";

export const groupsRoutes = (deps: HttpDependencies) =>
    new Elysia()
        .group("/groups", (app) =>
            app
                .get("/", () => deps.repositories.groups.list())
                .post("/", ({ body, set }) => {
                    set.status = 201;
                    return deps.useCases.createGroup.execute(body);
                }, { body: CreateGroupBody })
        );
