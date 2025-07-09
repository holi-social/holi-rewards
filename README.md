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

- [Local GraphiQL](http://localhost:8085/graphql)
- [Deployed Cloud Run Services](https://console.cloud.google.com/run?inv=1&invt=Ab2STg&project=holi-shared&pageState=(%22cloudRunServicesTable%22:(%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22holi_service_3Arewards_5C_22_22_2C_22s_22_3Atrue%257D%255D%22)))
