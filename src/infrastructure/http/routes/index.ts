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

import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";

export const registerRoutes = (app: Elysia, deps: HttpDependencies) => {
    const isTest = process.env.NODE_ENV === 'test';

    return app
        .use(cors())
        .use(isTest ? (a) => a : rateLimit())
        .onRequest(({ set }) => {
            set.headers['X-Content-Type-Options'] = 'nosniff';
            set.headers['X-Frame-Options'] = 'DENY';
            set.headers['X-XSS-Protection'] = '1; mode=block';
        })
        .get("/health", () => ({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }))
        .use(playersRoutes(deps))
        .use(teamsRoutes(deps))
        .use(participantsRoutes(deps))
        .use(tournamentsRoutes(deps))
        .use(entriesRoutes(deps))
        .use(bracketRoutes(deps))
        .use(matchesRoutes(deps))
        .use(groupsRoutes(deps));
};
