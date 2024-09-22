import AcceptRide from "../src/application/usecase/AcceptRide";
import GetRide from "../src/application/usecase/GetRide";
import RequestRide from "../src/application/usecase/RequestRide";
import Signup from "../src/application/usecase/Signup";
import { RIDE_STATUSES } from "../src/domain/RideStatus";
import { PgPromiseAdapter } from "../src/infra/database/DatabaseConnection";
import { Registry } from "../src/infra/di/DI";
import { MailerGatewayMemory } from "../src/infra/gateway/MailerGateway";
import { AccountRepositoryDatabase } from "../src/infra/repository/AccountRepository";
import { RideRepositoryDatabase } from "../src/infra/repository/RideRepository";

let signup: Signup;
let requestRide: RequestRide;
let getRide: GetRide;
let acceptRide: AcceptRide;
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
  Registry.getInstance().provide("mailerGateway", new MailerGatewayMemory());
  signup = new Signup();
  requestRide = new RequestRide();
  getRide = new GetRide();
  acceptRide = new AcceptRide();
});

test("Não deve aceitar uma corrida pelo fato da conta não ser de motorista", async function () {
  const inputSignup = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true,
  };
  const outputSignup = await signup.execute(inputSignup);
  const inputRequestRide = {
    passengerId: outputSignup.accountId,
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
    driverId: outputSignup.accountId,
    rideId: outputGetRide.rideId,
  };
  await expect(() => acceptRide.execute(inputAcceptRide)).rejects.toThrow(
    new Error("The account is not a driver")
  );
});

test("Deve aceitar uma corrida", async function () {
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
});

test("Não deve aceitar uma corrida pelo status da corrida ser diferente de requested", async function () {
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
  await acceptRide.execute(inputAcceptRide);

  await expect(() => acceptRide.execute(inputAcceptRide)).rejects.toThrow(
    new Error("Ride with status other than requested can't be accepted")
  );
});

test("Não deve aceitar uma corrida pelo fato do motorista já ter uma corrida aceita", async function () {
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
  await acceptRide.execute(inputAcceptRide);

  const outputRequestRideTwo = await requestRide.execute(inputRequestRide);
  const inputAcceptRideTwo = {
    driverId: outputSignupDriver.accountId,
    rideId: outputRequestRideTwo.rideId,
  };

  await expect(() => acceptRide.execute(inputAcceptRideTwo)).rejects.toThrow(
    new Error("Driver already has a ride in progress or accepted")
  );
});
