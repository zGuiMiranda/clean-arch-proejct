import AcceptRide from "../src/application/usecase/AcceptRide";
import GetRide from "../src/application/usecase/GetRide";
import RequestRide from "../src/application/usecase/RequestRide";
import Signup from "../src/application/usecase/Signup";
import StartRide from "../src/application/usecase/StartRide";
import UpdatePosition from "../src/application/usecase/UpdatePosition";
import { RIDE_STATUSES } from "../src/domain/RideStatus";
import { PgPromiseAdapter } from "../src/infra/database/DatabaseConnection";
import { Registry } from "../src/infra/di/DI";
import { MailerGatewayMemory } from "../src/infra/gateway/MailerGateway";
import { AccountRepositoryDatabase } from "../src/infra/repository/AccountRepository";
import { RideRepositoryDatabase } from "../src/infra/repository/RideRepository";
import { PositionRepositoryDatabase } from "../src/infra/repository/PositionRepository";

let signup: Signup;
let requestRide: RequestRide;
let getRide: GetRide;
let startRide: StartRide;
let acceptRide: AcceptRide;
let updatePosition: UpdatePosition;
beforeEach(() => {
  Registry.getInstance().provide(
    "databaseConnection",
    PgPromiseAdapter.getInstance()
  );
  Registry.getInstance().provide(
    "accountRepository",
    new AccountRepositoryDatabase()
  );
  Registry.getInstance().provide(
    "rideRepository",
    new RideRepositoryDatabase()
  );
  Registry.getInstance().provide(
    "positionRepository",
    PositionRepositoryDatabase.getInstance()
  );
  Registry.getInstance().provide("mailerGateway", new MailerGatewayMemory());
  signup = new Signup();
  requestRide = new RequestRide();
  getRide = new GetRide();
  startRide = new StartRide();
  acceptRide = new AcceptRide();
  updatePosition = new UpdatePosition();
});

test("Não deve atualizar uma posição por conta do status da corrida não ser in_progress", async function () {
  const inputSignupPassenger = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true,
  };

  const outputSignupPassenger = await signup.execute(inputSignupPassenger);

  const inputRequestRide = {
    passengerId: outputSignupPassenger.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476,
  };
  const outputRequestRide = await requestRide.execute(inputRequestRide);
  expect(outputRequestRide.rideId).toBeDefined();
  const outputGetRide = await getRide.execute(outputRequestRide.rideId);
  expect(outputGetRide.rideId).toBe(outputRequestRide.rideId);
  expect(outputGetRide.passengerId).toBe(inputRequestRide.passengerId);
  expect(outputGetRide.fromLat).toBe(inputRequestRide.fromLat);
  expect(outputGetRide.fromLong).toBe(inputRequestRide.fromLong);
  expect(outputGetRide.toLat).toBe(inputRequestRide.toLat);
  expect(outputGetRide.toLong).toBe(inputRequestRide.toLong);
  expect(outputGetRide.status).toBe(RIDE_STATUSES.REQUESTED);

  const inputUpdatePosition = {
    rideId: outputGetRide.rideId,
    lat: -27.496887588317275,
    long: -48.522234807851476,
  };

  await expect(() =>
    updatePosition.execute(inputUpdatePosition)
  ).rejects.toThrow(new Error("Ride is not in progress"));
});

test("Deve atualizar uma posição", async function () {
  const inputSignupPassenger = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true,
  };

  const inputSignupDriver = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isDriver: true,
    carPlate: "AAA9999",
  };
  const outputSignupPassenger = await signup.execute(inputSignupPassenger);
  const outputSignupDriver = await signup.execute(inputSignupDriver);

  const inputRequestRide = {
    passengerId: outputSignupPassenger.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476,
  };
  const outputRequestRide = await requestRide.execute(inputRequestRide);
  expect(outputRequestRide.rideId).toBeDefined();
  const outputGetRide = await getRide.execute(outputRequestRide.rideId);
  expect(outputGetRide.rideId).toBe(outputRequestRide.rideId);
  expect(outputGetRide.passengerId).toBe(inputRequestRide.passengerId);
  expect(outputGetRide.fromLat).toBe(inputRequestRide.fromLat);
  expect(outputGetRide.fromLong).toBe(inputRequestRide.fromLong);
  expect(outputGetRide.toLat).toBe(inputRequestRide.toLat);
  expect(outputGetRide.toLong).toBe(inputRequestRide.toLong);
  expect(outputGetRide.status).toBe(RIDE_STATUSES.REQUESTED);

  const inputAcceptRide = {
    driverId: outputSignupDriver.accountId,
    rideId: outputGetRide.rideId,
  };
  const outputAcceptRide = await acceptRide.execute(inputAcceptRide);

  expect(outputAcceptRide?.status).toBeDefined();
  expect(outputAcceptRide?.status).toBe(RIDE_STATUSES.ACCEPTED);

  expect(outputAcceptRide?.driverId).toBeDefined();
  expect(outputAcceptRide?.driverId).toBe(inputAcceptRide.driverId);

  expect(outputAcceptRide?.id).toBeDefined();
  expect(outputAcceptRide?.id).toBe(inputAcceptRide.rideId);

  const startRideInput = {
    rideId: outputAcceptRide.id,
  };

  const outputStartRide = await startRide.execute(startRideInput);

  expect(outputStartRide?.status).toBeDefined();
  expect(outputStartRide?.status).toBe(RIDE_STATUSES.IN_PROGRESS);

  expect(outputStartRide?.id).toBeDefined();
  expect(outputStartRide?.id).toBe(startRideInput.rideId);

  const inputUpdatePosition = {
    rideId: outputGetRide.rideId,
    lat: -27.496887588317255,
    long: -48.522234807851471,
  };

  const outputUpdatePosition = await updatePosition.execute(
    inputUpdatePosition
  );

  expect(outputUpdatePosition?.rideId).toBeDefined();
  expect(outputUpdatePosition?.rideId).toBe(inputUpdatePosition.rideId);

  expect(outputUpdatePosition?.lat).toBeDefined();
  expect(outputUpdatePosition?.lat).toBe(inputUpdatePosition.lat);

  expect(outputUpdatePosition?.long).toBeDefined();
  expect(outputUpdatePosition?.long).toBe(inputUpdatePosition.long);
});
