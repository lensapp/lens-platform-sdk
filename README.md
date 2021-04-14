# Lens Platform Sdk

Lens Platform Client SDK

Use SDK in Lens extension:
```ts
import { LensPlatformClient } from "lens-platform-sdk"
import { Component } from "@k8slens/extensions";

const lensPlatformClient = new LensPlatformClient({
    accessToken: "", // the access token for apis
    getAccessToken: () => {}, // the callback to be called before every request, useful if the access token needs to be renew often.
    keyCloakAddress: "", // keycloak address, e.g. "https://keycloak.k8slens.dev"
    keycloakRealm: "", // the realm name, e.g. "lensCloud" 
    apiEndpointAddress: "", // api endpoint address, e.g. "https://api.k8slens.dev"
    exceptionHandler: (exception): void => {
      Component.Notifications.error(`${exception.message} ${exception.response?.body}`)
    }
});
```

## Lint

We are using xo (an `eslint` wrapper with good defaults) as linter.

Auto fix
`npx xo --fix`

Install xo editor plugins for better DX
<https://github.com/xojs/xo#editor-plugins>

Search `xo` in `package.json` to change settings
