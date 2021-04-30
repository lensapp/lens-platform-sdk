import { NotFoundException } from "./common.exceptions";

export class SpaceNotFoundException extends NotFoundException {
  constructor(spaceName: string) {
    super(`Couldn't find space "${spaceName}"`);
  }
}
