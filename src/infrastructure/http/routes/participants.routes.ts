import { Elysia, t } from "elysia";
import { CreateParticipantBody, IdentifierSchema } from "../schemas";
import type { HttpDependencies } from "../types";

export const participantsRoutes = (deps: HttpDependencies) =>
    new Elysia()
        .group("/participants", (app) =>
            app
                .get("/", async () =>
                    (await deps.repositories.participants.list()).map((p) =>
                        p.toPrimitives()
                    ), {
                    detail: {
                        tags: ['Participants'],
                        summary: 'Listar participantes',
                        description: 'Obtiene la lista completa de participantes'
                    }
                }
                )
                .get(
                    "/:participantId",
                    async ({ params }) =>
                        (
                            await deps.repositories.participants.findById(
                                params.participantId
                            )
                        )?.toPrimitives(),
                    {
                        params: t.Object({ participantId: IdentifierSchema }),
                        detail: {
                            tags: ['Participants'],
                            summary: 'Obtener participante',
                            description: 'Obtiene los detalles de un participante específico'
                        }
                    }
                )
                .post(
                    "/",
                    async ({ body, set }) => {
                        const participant =
                            await deps.useCases.createParticipant.execute(body);
                        set.status = 201;
                        return participant.toPrimitives();
                    },
                    {
                        body: CreateParticipantBody,
                        detail: {
                            tags: ['Participants'],
                            summary: 'Crear participante',
                            description: 'Crea un nuevo participante (jugador o equipo)'
                        }
                    }
                )
        );
