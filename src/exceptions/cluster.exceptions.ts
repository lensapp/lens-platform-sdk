import { NotFoundException } from "./common.exceptions";

export class ClusterNotFoundException extends NotFoundException {
  /**
   * ClusterNotFoundException
   * @param id - Cluster id
   */
  constructor(id?: string) {
    super(`Couldn't find cluster${id ? ` "${id}"` : ""}`);
    Object.setPrototypeOf(this, ClusterNotFoundException.prototype);
  }
}
