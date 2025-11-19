import { Elysia } from "elysia";

import { playersRoutes } from "./players.routes";
import { teamsRoutes } from "./teams.routes";
import { participantsRoutes } from "./participants.routes";
import { tournamentsRoutes } from "./tournaments.routes";
import { entriesRoutes } from "./entries.routes";
import { bracketRoutes } from "./bracket.routes";
import { matchesRoutes } from "./matches.routes";
import { groupsRoutes } from "./groups.routes";
import { HttpDependencies } from "../types";

export const registerRoutes = (app: Elysia, deps: HttpDependencies) =>
    app
        .use(playersRoutes(deps))
        .use(teamsRoutes(deps))
        .use(participantsRoutes(deps))
        .use(tournamentsRoutes(deps))
        .use(entriesRoutes(deps))
        .use(bracketRoutes(deps))
        .use(matchesRoutes(deps))
        .use(groupsRoutes(deps));
