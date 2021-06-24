import { NotFoundException, LensSDKException } from "./common.exceptions";

export class SpaceNotFoundException extends NotFoundException {
  constructor(spaceName?: string) {
    super(`Couldn't find space${spaceName ? ` "${spaceName}"` : ""}`);
    Object.setPrototypeOf(this, SpaceNotFoundException.prototype);
  }
}

export class SpaceNameReservedException extends LensSDKException {
  constructor(spaceName: string) {
    super(422, `Space name '${spaceName}' is already reserved, please use a different name`);
    Object.setPrototypeOf(this, SpaceNameReservedException.prototype);
  }
}

export class SpaceHasTooManyClustersException extends LensSDKException {
  constructor(spaceName: string) {
    super(422, `Space '${spaceName}' has too many k8s clusters`);
    Object.setPrototypeOf(this, SpaceHasTooManyClustersException.prototype);
  }
}

export class CantRemoveOwnerFromSpaceException extends LensSDKException {
  constructor(userName: string) {
    super(422, `Cannot remove Owner '${userName}' from space`);
    Object.setPrototypeOf(this, CantRemoveOwnerFromSpaceException.prototype);
  }
}
