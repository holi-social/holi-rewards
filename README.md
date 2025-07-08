# holi-rewards

## First Run

1. start project
   ```sh
   docker compose up -d
   ```

2. migrate database
   ```sh
   docker compose exec app deno run db:migrate
   ```

3. (optional) Generate some test data
   ```sh
   docker compose exec app deno run db:seed
   ```

## Links

- [GraphiQL](http://localhost:8085/graphql)
