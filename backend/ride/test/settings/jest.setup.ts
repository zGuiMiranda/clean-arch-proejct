import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";
import { Registry } from "../../src/infra/di/DI";

beforeAll(async () => {
  Registry.getInstance().provide(
    "databaseConnection",
    PgPromiseAdapter.getInstance()
  );
});

afterAll(async () => {
  const connection: DatabaseConnection =
    Registry.getInstance().inject("databaseConnection");
  await connection.close();
});
