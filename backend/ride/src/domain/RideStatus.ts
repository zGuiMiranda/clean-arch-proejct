export enum RIDE_STATUSES {
  COMPLETED = "COMPLETED",
  REQUESTED = "REQUESTED",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
}
export default class RideStatus {
  private status: RIDE_STATUSES;
  constructor(status: RIDE_STATUSES) {
    this.status = status;
  }

  getValue() {
    return this.status;
  }
}
