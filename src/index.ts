import { buildApp } from "./app";

const startServer = async () => {
  const { app } = await buildApp();
  const server = app.listen(3000);

  console.log(
    `🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`
  );
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
