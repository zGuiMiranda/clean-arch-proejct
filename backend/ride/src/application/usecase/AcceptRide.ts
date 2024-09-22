import { RIDE_STATUSES } from "../../domain/RideStatus";
import { inject } from "../../infra/di/DI";
import AccountRepository from "../../infra/repository/AccountRepository";
import RideRepository from "../../infra/repository/RideRepository";

export default class AcceptRide {
  @inject("accountRepository")
  accountRepository?: AccountRepository;
  @inject("rideRepository")
  rideRepository?: RideRepository;

  async execute(input: Input): Promise<Output> {
    const account = await this.accountRepository?.getAccountById(
      input.driverId
    );
    if (!account?.isDriver) throw new Error("The account is not a driver");

    const ride = await this.rideRepository?.getRideById(input.rideId);

    if (ride?.statusValue !== RIDE_STATUSES.REQUESTED)
      throw new Error(
        "Ride with status other than requested can't be accepted"
      );

    const ridesByDriver =
      await this.rideRepository?.getRidesByDriverIdAndStatus(input.driverId, [
        RIDE_STATUSES.IN_PROGRESS,
        RIDE_STATUSES.ACCEPTED,
      ]);

    if (ridesByDriver?.length)
      throw new Error("Driver already has a ride in progress or accepted");

    await this.rideRepository?.acceptRide(
      RIDE_STATUSES.ACCEPTED,
      input.driverId,
      input.rideId
    );

    const rideById = await this.rideRepository?.getRideById(input.rideId);

    if (!rideById) throw new Error("Ride not found");

    return {
      status: rideById?.statusValue,
      id: rideById.getRideId(),
      driverId: rideById.getDriverId()!,
    };
  }
}

type Input = {
  rideId: string;
  driverId: string;
};

type Output = { status: RIDE_STATUSES; id: string; driverId: string };
