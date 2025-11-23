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
import { swagger } from "@elysiajs/swagger";

export const registerRoutes = (app: Elysia, deps: HttpDependencies) => {
    const isTest = process.env.NODE_ENV === 'test';

    return app
        .use(cors())
        .use(swagger({
            documentation: {
                info: {
                    title: 'Evolution Tournaments API',
                    version: '1.0.0',
                    description: 'API para gestión de torneos con arquitectura limpia'
                },
                tags: [
                    { name: 'Health', description: 'Health check endpoints' },
                    { name: 'Players', description: 'Gestión de jugadores' },
                    { name: 'Teams', description: 'Gestión de equipos' },
                    { name: 'Participants', description: 'Gestión de participantes' },
                    { name: 'Tournaments', description: 'Gestión de torneos' },
                    { name: 'Entries', description: 'Inscripciones a torneos' },
                    { name: 'Brackets', description: 'Generación y visualización de brackets' },
                    { name: 'Matches', description: 'Gestión de partidos' },
                    { name: 'Groups', description: 'Gestión de grupos' }
                ],
                servers: [
                    {
                        url: 'http://localhost:3000',
                        description: 'Development server'
                    }
                ]
            }
        }))
        // .use(isTest ? (a) => a : rateLimit())
        .onRequest(({ set }) => {
            set.headers['X-Content-Type-Options'] = 'nosniff';
            set.headers['X-Frame-Options'] = 'DENY';
            set.headers['X-XSS-Protection'] = '1; mode=block';
        })
        .get("/health", () => ({
            status: "ok",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        }), {
            detail: {
                tags: ['Health'],
                summary: 'Health check',
                description: 'Verifica el estado del servidor'
            }
        })
        .use(playersRoutes(deps))
        .use(teamsRoutes(deps))
        .use(participantsRoutes(deps))
        .use(tournamentsRoutes(deps))
        .use(entriesRoutes(deps))
        .use(bracketRoutes(deps))
        .use(matchesRoutes(deps))
        .use(groupsRoutes(deps));
};
