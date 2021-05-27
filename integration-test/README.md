# Integration tests

The integration tests are executed against the staging environment. The GitHub Action secrets are specified to provide the required environmental variables.

The integration tests expect `STAGING_USERNAME` and `STAGING_PASSWORD` environmental variables when running the tests:
- STAGING_USERNAME, Username of the test user
- STAGING_PASSWORD, Password of the test user
- KEYCLOAK_ADDRESS, Url to the Keycloak instance
- KEYCLOAK_REALM, Name of the Keycloak Realm
- API_ENDPOINT_ADDRESS, Url to the backend

You may specify these in .env file in the root of the project (don't commit this file to the repository).

Note: The Keycloak instance must allow Direct Access Grant so that the test user can fetch token using username/password credentials.
