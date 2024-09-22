import Position from "../../domain/Position";
import { RIDE_STATUSES } from "../../domain/RideStatus";
import { inject } from "../../infra/di/DI";
import AccountRepository from "../../infra/repository/AccountRepository";
import RideRepository from "../../infra/repository/RideRepository";
import PositionRepository from "../../infra/repository/PositionRepository";

export default class UpdatePosition {
  @inject("accountRepository")
  accountRepository?: AccountRepository;
  @inject("rideRepository")
  rideRepository?: RideRepository;
  @inject("positionRepository")
  positionRepository?: PositionRepository;
  async execute(input: Input): Promise<Output> {
    const ride = await this.rideRepository?.getRideById(input.rideId);

    if (ride?.statusValue !== RIDE_STATUSES.IN_PROGRESS)
      throw new Error("Ride is not in progress");

    const positionDomain = Position.create(input.lat, input.long, input.rideId);

    await this.positionRepository?.updatePosition(
      positionDomain.PositionId,
      positionDomain.Lat,
      positionDomain.Long,
      positionDomain.Ride
    );

    const position = await this.positionRepository?.getPositionById(
      positionDomain.PositionId
    );

    if (!position) throw new Error("Position not found");

    return {
      rideId: position.Ride,
      lat: position.Lat,
      long: position.Long,
    };
  }
}

type Input = {
  rideId: string;
  lat: number;
  long: number;
};

type Output = { rideId: string; lat: number; long: number };
