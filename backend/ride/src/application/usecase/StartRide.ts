import { inject } from "../../infra/di/DI";
import RideRepository from "../../infra/repository/RideRepository";
import { RIDE_STATUSES } from "./../../domain/RideStatus";

export default class StartRide {
  @inject("rideRepository")
  rideRepository?: RideRepository;

  async execute(input: Input): Promise<Output> {
    const rideById = await this.rideRepository?.getRideById(input.rideId);
    if (rideById?.statusValue !== RIDE_STATUSES.ACCEPTED)
      throw new Error("Ride is not accepted");

    await this.rideRepository?.updateRideStatus(
      input.rideId,
      RIDE_STATUSES.IN_PROGRESS
    );

    const ride = await this.rideRepository?.getRideById(input.rideId);

    return {
      status: ride?.statusValue!,
      id: ride?.getRideId()!,
    };
  }
}

type Input = {
  rideId: string;
};

type Output = { status: RIDE_STATUSES; id: string };
