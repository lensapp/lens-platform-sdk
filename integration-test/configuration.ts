const getEnvironmentalVariable = (name: string) => {
  if (process.env[name] === undefined) {
    throw new Error(`Environmental variable ${name} not set`);
  }

  return process.env[name] as unknown as string;
};

export const config = {
  users: [
    {
      username: getEnvironmentalVariable("STAGING_USERNAME_1"),
      password: getEnvironmentalVariable("STAGING_PASSWORD_1"),
    },
    {
      username: getEnvironmentalVariable("STAGING_USERNAME_2"),
      password: getEnvironmentalVariable("STAGING_PASSWORD_2"),
    },
    {
      username: getEnvironmentalVariable("STAGING_USERNAME_3"),
      password: getEnvironmentalVariable("STAGING_PASSWORD_3"),
      subscriptionId: getEnvironmentalVariable("STAGING_SUBSCRIPTION_ID_1"),
    },
    {
      username: getEnvironmentalVariable("STAGING_USERNAME_4"),
      password: getEnvironmentalVariable("STAGING_PASSWORD_4"),
      subscriptionId: getEnvironmentalVariable("STAGING_SUBSCRIPTION_ID_1"),
    },
  ],
  keyCloakAddress: getEnvironmentalVariable("KEYCLOAK_ADDRESS"),
  keycloakClientId: "lens-extension",
  keycloakRealm: getEnvironmentalVariable("KEYCLOAK_REALM"),
  apiEndpointAddress: getEnvironmentalVariable("API_ENDPOINT_ADDRESS"),
  tokenHost: getEnvironmentalVariable("TOKEN_HOST")
};
