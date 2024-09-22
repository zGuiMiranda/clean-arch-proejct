import pgp from "pg-promise";

export default interface DatabaseConnection {
  query(statement: string, params: any): Promise<any>;
  close(): Promise<void>;
  deleteAll(statement: string): Promise<void>;
}

export class PgPromiseAdapter implements DatabaseConnection {
  connection: any;
  private static instance: PgPromiseAdapter;

  private constructor() {
    this.connection = pgp()("postgres://postgres:123456@localhost:8080/app");
  }

  static getInstance(): PgPromiseAdapter {
    if (!PgPromiseAdapter.instance) {
      PgPromiseAdapter.instance = new PgPromiseAdapter();
    }
    return PgPromiseAdapter.instance;
  }

  query(statement: string, params: any): Promise<any> {
    return this.connection?.query(statement, params);
  }

  async close(): Promise<void> {
    await this.connection?.$pool.end();
  }

  async deleteAll(statement: string): Promise<void> {
    await this.connection.none(statement);
  }
}
