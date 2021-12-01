// A random jwt from https://www.jsonwebtoken.io/
export const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImp0aSI6ImI4Y2RmMmRjLTA3ZmUtNDc5Ny1iOWZkLThmYjlmYTMyZGMyZiIsImlhdCI6MTYxODQ4Mjc3OCwiZXhwIjoxNjE4NDg2Mzc4fQ.h9jJveiwYLPDIX3ZIqB-06QH6CLTDVKToSfWJnwRAgg";
export const apiEndpointAddress = "http://api.endpoint";
export const minimumOptions = {
  accessToken, // The access token for apis
  keyCloakAddress: "", // Keycloak address, e.g. "https://keycloak.k8slens.dev"
  keycloakRealm: "", // The realm name, e.g. "lensCloud"
  apiEndpointAddress, // Api endpoint address, e.g. "https://api.k8slens.dev"
};
