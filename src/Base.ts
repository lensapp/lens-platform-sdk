import type { LensPlatformClientType } from "./index";

export class Base {
  lensPlatformClient: LensPlatformClientType;

  constructor(lensPlatformClient: LensPlatformClientType) {
    this.lensPlatformClient = lensPlatformClient;
  }
}
