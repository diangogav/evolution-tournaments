FROM oven/bun AS build

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install

COPY ./src ./src
COPY ./prisma ./prisma

ENV NODE_ENV=production

#Generate the Prisma Client for the distroless image
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"

RUN bun run prisma:generate

RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# use the distroless cc images because prisma needs a cc libary
FROM gcr.io/distroless/cc

WORKDIR /app

COPY --from=build /app/server server
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma

ENV NODE_ENV=production


CMD ["./server"]
