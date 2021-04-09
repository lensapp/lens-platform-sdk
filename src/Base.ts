import type LensPlatformClient from './index';

export class Base {
  lensPlatformClient: LensPlatformClient;
  constructor(lensPlatformClient: LensPlatformClient) {
    this.lensPlatformClient = lensPlatformClient;
  }
}
