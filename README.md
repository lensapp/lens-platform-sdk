# Lens Platform Sdk

Lens Platform Client SDK

Use SDK in Lens extension:

```ts
import { LensPlatformClient } from "lens-platform-sdk";
import { Component } from "@k8slens/extensions";

// axios is used by lens-platform-sdk
import axios from "axios";

// Use NodeJS HTTP adapter to get around CORS issues
axios.defaults.adapter = require("axios/lib/adapters/http");

const lensPlatformClient = new LensPlatformClient({
    accessToken: "", // the access token for apis
    getAccessToken: () => Promise.resolve("<token>"), // the callback to be called before every request, useful if the access token needs to be renew often.
    keyCloakAddress: "", // keycloak address, e.g. "https://keycloak.k8slens.dev"
    keycloakRealm: "", // the realm name, e.g. "lensCloud" 
    apiEndpointAddress: "", // api endpoint address, e.g. "https://api.k8slens.dev"
    httpAdapter: false // Optional, defaults to false. If true, the axios HTTP adapter is used instead of xhr
    logLevel: "debug" // Optional, defaults to 'silent'. Options are 'silent' | 'debug' | 'error'
});
```

The SDK uses axios internally for HTTP(s) requests.

## Lint

```bash
npm run lint
```

## Using the SDK in Electron

You will need to change the Axios HTTP adapter to use Node to get around CORS issues:
```
// Set in LensPlatformClient options:
httpAdapter: true
```

If webpack is used, you also need to prevent webpack from using the "browser" property of package.json of axios, which would override http adapter resolving to use the xhr. xhr could cause CORS issues.

```
    resolve: {
      // ...
      aliasFields: []
    },
```

## Type Check

You should enable ts support in you editor with type-checking.

Or type-checking from CLI

```bash
npm run check:type
```

## Test

The "all-in-one" test script would run linter, type-checking, and unit tests in parallel.

```bash
npm run test
```

You can also run unit tests only

```bash
npm run test:unit [-- --watch]
```

which is just a shortcut for `npx jest [--watch]`

## Documentation

We use `tsdoc` <https://github.com/microsoft/tsdoc> for inline doc comments.

## License

Copyright (c) 2021 Mirantis, Inc.

Licensed under the MIT license.
<https://opensource.org/licenses/MIT>

