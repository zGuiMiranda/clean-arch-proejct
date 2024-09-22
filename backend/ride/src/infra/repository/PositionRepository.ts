import Position from "../../domain/Position";
import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/DI";

export default interface PositionRepository {
  getPositionById(positionId: string): Promise<Position>;
  updatePosition(
    positionId: string,
    lat: number,
    long: number,
    rideId: string
  ): Promise<void>;
}

export class PositionRepositoryDatabase implements PositionRepository {
  @inject("databaseConnection")
  connection?: DatabaseConnection;

  private static instance: PositionRepositoryDatabase;

  private constructor() {}

  static getInstance(): PositionRepositoryDatabase {
    if (!PositionRepositoryDatabase.instance) {
      return new PositionRepositoryDatabase();
    }
    return PositionRepositoryDatabase.instance;
  }

  async getPositionById(positionId: string): Promise<Position> {
    const [positionData] = await this.connection?.query(
      "select * from ccca.position where position_id = $1",
      [positionId]
    );
    return new Position(
      positionData?.position_id,
      parseFloat(positionData?.lat),
      parseFloat(positionData?.long),
      positionData?.ride_id
    );
  }

  async updatePosition(
    positionId: string,
    lat: number,
    long: number,
    rideId: string
  ): Promise<void> {
    await this.connection?.query(
      "insert into ccca.position (position_id, lat, long, ride_id) values ($1, $2, $3, $4)",
      [positionId, lat, long, rideId]
    );
  }
}
