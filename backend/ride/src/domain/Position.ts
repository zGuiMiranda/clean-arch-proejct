import Coord from "./Coord";
import Ride from "./Ride";
import UUID from "./UUID";

export default class Position {
  private positionId: UUID;
  private long: Coord;
  private lat: Coord;
  private rideId: string;

  constructor(
    positionId: string,
    longLat: number,
    longLong: number,
    rideId: string
  ) {
    this.positionId = new UUID(positionId);
    this.long = new Coord(longLat, longLong);
    this.lat = new Coord(longLat, longLong);
    this.rideId = rideId;
  }

  static create(longLat: number, longLong: number, rideId: string) {
    const id = UUID.create();
    return new Position(id.getValue(), longLat, longLong, rideId);
  }

  get PositionId(): string {
    return this.positionId.getValue();
  }

  get Long(): number {
    return this.long.getLong();
  }

  get Lat(): number {
    return this.lat.getLat();
  }

  get Ride(): string {
    return this.rideId;
  }
}
