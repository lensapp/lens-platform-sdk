# Integration tests

The integration tests are executed against the staging environment. The GitHub Action secrets `STAGING_USERNAME` and `STAGING_PASSWORD` are available for a test user.

The integration tests expect `STAGING_USERNAME` and `STAGING_PASSWORD` environmental variables when running the tests.
