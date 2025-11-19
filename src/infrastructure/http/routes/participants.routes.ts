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
                    )
                )
                .get(
                    "/:participantId",
                    async ({ params }) =>
                        (
                            await deps.repositories.participants.findById(
                                params.participantId
                            )
                        )?.toPrimitives(),
                    { params: t.Object({ participantId: IdentifierSchema }) }
                )
                .post(
                    "/",
                    async ({ body, set }) => {
                        const participant =
                            await deps.useCases.createParticipant.execute(body);
                        set.status = 201;
                        return participant.toPrimitives();
                    },
                    { body: CreateParticipantBody }
                )
        );
