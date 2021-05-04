import { NotFoundException, LensSDKException } from "./common.exceptions";

export class SpaceNotFoundException extends NotFoundException {
  constructor(spaceName: string) {
    super(`Couldn't find space "${spaceName}"`);
  }
}

export class SpaceNameReservedException extends LensSDKException {
  constructor(spaceName: string) {
    super(422, `Space name '${spaceName}' is already reserved, please use a different name`);
  }
}

export class SpaceHasTooManyClustersException extends LensSDKException {
  constructor(spaceName: string) {
    super(422, `Space '${spaceName}' has too many k8s clusters`);
  }
}

export class CantRemoveOwnerFromSpace extends LensSDKException {
  constructor(userName: string) {
    super(422, `Cannot remove Owner '${userName}' from space`);
  }
}
