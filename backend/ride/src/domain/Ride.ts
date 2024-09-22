import Coord from "./Coord";
import RideStatus, { RIDE_STATUSES } from "./RideStatus";
import UUID from "./UUID";

export default class Ride {
  private rideId: UUID;
  private passengerId: UUID;
  private from: Coord;
  private to: Coord;
  private status: RideStatus;
  private date: Date;
  private driverId?: UUID;

  constructor(
    rideId: string,
    passengerId: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
    status: RIDE_STATUSES,
    date: Date,
    driverId?: string
  ) {
    this.rideId = new UUID(rideId);
    this.passengerId = new UUID(passengerId);
    this.from = new Coord(fromLat, fromLong);
    this.to = new Coord(toLat, toLong);
    this.status = new RideStatus(status);
    this.date = date;
    this.driverId = driverId ? new UUID(driverId) : undefined;
  }
  static create(
    passengerId: string,
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
    driverId?: string
  ) {
    const uuid = UUID.create();
    const status = RIDE_STATUSES.REQUESTED;
    const date = new Date();
    return new Ride(
      uuid.getValue(),
      passengerId,
      fromLat,
      fromLong,
      toLat,
      toLong,
      status,
      date,
      driverId
    );
  }

  getRideId() {
    return this.rideId.getValue();
  }

  getPassengerId() {
    return this.passengerId.getValue();
  }

  getFrom() {
    return this.from;
  }

  getTo() {
    return this.to;
  }

  get statusValue() {
    return this.status.getValue();
  }

  getDate() {
    return this.date;
  }

  // get dateValue(): Date {
  //   return this.date;
  // }

  getDriverId() {
    return this.driverId?.getValue();
  }
}
