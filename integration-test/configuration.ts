const getEnvironmentalVariable = (name: string) => {
  if (process.env[name] === undefined) {
    throw new Error(`Environmental variable ${name} not set`);
  }

  return process.env[name] as unknown as string;
};

export const config = {
  user: {
    username: getEnvironmentalVariable("STAGING_USERNAME"),
    password: getEnvironmentalVariable("STAGING_PASSWORD")
  },
  keyCloakAddress: getEnvironmentalVariable("KEYCLOAK_ADDRESS"),
  keycloakClientId: "lens-extension",
  keycloakRealm: getEnvironmentalVariable("KEYCLOAK_REALM"),
  apiEndpointAddress: getEnvironmentalVariable("API_ENDPOINT_ADDRESS")
};
