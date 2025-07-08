FROM denoland/deno:2.4.0

WORKDIR /app
COPY . .

RUN deno cache src/index.ts

CMD ["deno", "run", "-A", "src/index.ts"]