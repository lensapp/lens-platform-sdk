# Integration tests

The integration tests are executed against the staging environment. The GitHub Action secrets are specified to provide the required environmental variables.

The integration tests expect `STAGING_USERNAME_1` , `STAGING_PASSWORD_1`, `STAGING_USERNAME_2` and `STAGING_PASSWORD_2`  environmental variables when running the tests:
- `STAGING_USERNAME_1`, Username of the test user 1
- `STAGING_PASSWORD_1`, Password of the test user 1
- `STAGING_USERNAME_2`, Username of the test user 2
- `STAGING_PASSWORD_2`, Password of the test user 2
- `KEYCLOAK_ADDRESS`, Url to the Keycloak instance
- `KEYCLOAK_REALM`, Name of the Keycloak Realm
- `API_ENDPOINT_ADDRESS`, Url to the backend
- `TOKEN_HOST`, Url to the token host

You may specify these in .env file in the root of the project. **Don't commit this file to the repository).**

Note: The Keycloak instance must allow Direct Access Grant so that the test user can fetch token using username/password credentials. This can be done in the Keycloak's Administrator Console (Clients -> "lens-extension" -> "Direct Access Grants Enabled" - ON).
