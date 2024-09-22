import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/DI";
import Ride from "../../domain/Ride";
import { RIDE_STATUSES } from "../../domain/RideStatus";

export default interface RideRepository {
  saveRide(ride: Ride): Promise<void>;
  getRideById(rideId: string): Promise<Ride>;
  getRidesByDriverIdAndStatus(
    driverId: string,
    statuses: RIDE_STATUSES[]
  ): Promise<Ride[]>;
  acceptRide(
    status: RIDE_STATUSES,
    driverId: string,
    rideId: string
  ): Promise<void>;
  updateRideStatus(rideId: string, status: RIDE_STATUSES): Promise<void>;
}

export class RideRepositoryDatabase implements RideRepository {
  @inject("databaseConnection")
  connection?: DatabaseConnection;

  async saveRide(ride: Ride): Promise<void> {
    await this.connection?.query(
      "insert into ccca.ride (ride_id, passenger_id, from_lat, from_long, to_lat, to_long, status, date) values ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        ride.getRideId(),
        ride.getPassengerId(),
        ride.getFrom().getLat(),
        ride.getFrom().getLong(),
        ride.getTo().getLat(),
        ride.getTo().getLong(),
        ride.statusValue,
        ride.getDate(),
      ]
    );
  }

  async getRideById(rideId: string): Promise<Ride> {
    const [rideData] = await this.connection?.query(
      "select * from ccca.ride where ride_id = $1",
      [rideId]
    );
    return new Ride(
      rideData.ride_id,
      rideData.passenger_id,
      parseFloat(rideData.from_lat),
      parseFloat(rideData.from_long),
      parseFloat(rideData.to_lat),
      parseFloat(rideData.to_long),
      rideData.status,
      rideData.date,
      rideData.driver_id
    );
  }

  async getRidesByDriverIdAndStatus(
    driverId: string,
    statuses: RIDE_STATUSES[]
  ): Promise<Ride[]> {
    const ridesData: any[] = await this.connection?.query(
      "select * from ccca.ride where driver_id = $1 AND status = ANY($2::text[])",
      [driverId, statuses]
    );

    const rides = ridesData.map(
      (ride) =>
        new Ride(
          ride.ride_id,
          ride.passenger_id,
          parseFloat(ride.from_lat),
          parseFloat(ride.from_long),
          parseFloat(ride.to_lat),
          parseFloat(ride.to_long),
          ride.status,
          ride.date
        )
    );
    return rides;
  }

  async acceptRide(
    status: RIDE_STATUSES,
    driverId: string,
    rideId: string
  ): Promise<void> {
    await this.connection?.query(
      "UPDATE ccca.ride SET status = $1, driver_id = $2 WHERE ride_id = $3",
      [status, driverId, rideId]
    );
  }

  async updateRideStatus(rideId: string, status: RIDE_STATUSES): Promise<void> {
    await this.connection?.query(
      "UPDATE ccca.ride SET status = $1 WHERE ride_id = $2",
      [status, rideId]
    );
  }
}
