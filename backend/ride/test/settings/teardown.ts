import DatabaseConnection, {
  PgPromiseAdapter,
} from "../../src/infra/database/DatabaseConnection";
import { Registry } from "../../src/infra/di/DI";

module.exports = async () => {
  Registry.getInstance().provide(
    "databaseConnection",
    PgPromiseAdapter.getInstance()
  );
  const connection: DatabaseConnection =
    Registry.getInstance().inject("databaseConnection");
  await connection.deleteAll("DELETE FROM ccca.account");
};
