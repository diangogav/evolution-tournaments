import { buildApp } from "./app";

const { app } = buildApp();
const server = app.listen(3000);

console.log(
  `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`
);
