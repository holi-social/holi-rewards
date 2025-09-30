FROM denoland/deno:2.5.2

WORKDIR /app
COPY . .

RUN deno cache src/index.ts

CMD ["deno", "task", "prod"]