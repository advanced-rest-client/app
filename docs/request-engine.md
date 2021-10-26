# ARC engine

The engine for processing ARC requests.

This module contains the logic that is executed after the ARC request object is dispatches via DOM event to be executed. The logic pre-processes the request, executes ARC request actions, and executes it. When the response is ready then it executes ARC response actions, and reports the response.

## ARC modules

In the middle of both pre- and post- processing ARC executes registered external modules. A module is a JavaScript library that is executed in the renderer process and has access to some of ARC's APIs. The module is executed in the context of a request or a response. The modules can manipulate the request and the response objects before it is send to the transport library or back to the application.

To register a module create a JavaScript library (using ES modules syntax) and define the `package.json` file. The name of the package is the identifier of the library so use scopes (e.g. `@my-scope/my-library`) to avoid name collisions.

### ARC entry in package.json file

In the `package.json` file define the `arc` entry with the `request-engine` object with the following options:

```json
{
  "arc": {
    "version": ">=16.0.0",
    "request-engine": {
      "context": {
        "request": "./lib/request.js",
        "response": "./lib/response.js",
      }
    },
    "permissions": ["environment", "events", "store"],
    "deprecated": {
      "message": "Deprecation message",
      "action": "https://learn.more"
    }
  }
}

```

All properties are optional.

#### permissions

The list of permissions your module requires to work. This list influences the structure of the context object passed to your main function (see below).

The `environment` entry adds the current environment and variables information to the context. This is considered a secret so don't use this unless your module actually needs to read the environment data. Users may not want to install the module when this permission is set.

The `events` permissions adds a reference to ARC's events object. This object is used internally to dispatch the DOM events that are uses as an internal communication channel between modules. When the `store` permission is set it also adds the model related events to the context object passed to the main function.

#### request-engine

This is the configuration of which file should be executed in which context.

The `request` context executed the file in the pre-request processing. The `response` is executed after the response is reported back from the request transport.

#### deprecated

To be used when the module is being deprecated by the author. The application shows an information message that a module is deprecated. The user will read the `message` defined in the `deprecated` entry. The optional `action` property is a link to a learn more page were your users can learn more about why the module is being deprecated.

### Defining a module

A module is just a regular JavaScript module. It defines and exports the main function that is being executed in the corresponding context.

#### Limitations

A module is executed in the renderer process (the UI process) without Node.js integration. You won't be able to request any library preinstalled with ARC. The only modules you can use is the installed with your module.

Modules cannot use Node.JS APIs. Only web platform APIs are allowed. This probably will be limited in the future through the [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).

The request is being paused while your module is being executed. Make sure that your logic always finish executing the function.

#### Defining a request context module

```javascript

export default async function(request, context, signal) {
  ...
}

```

The main function receives 3 arguments.

- `request` the ARC request object which can be: `ArcBaseRequest`, `ARCHistoryRequest`, or `ARCSavedRequest`. See [this types definition](https://github.com/advanced-rest-client/arc-types/blob/master/src/request/ArcRequest.d.ts) for more information.
- `context` the execution context (see below)
- `signal` The `AbortSignal` object that should be used to abort the task when requested by the user.

#### Defining a response context module

```javascript

export default async function(request, executed, response, context, signal) {
  ...
}

```

The main function receives 5 arguments.

- `request` the ARC request object which can be: `ArcBaseRequest`, `ARCHistoryRequest`, or `ARCSavedRequest`. See [this types definition](https://github.com/advanced-rest-client/arc-types/blob/master/src/request/ArcRequest.d.ts) for more information.
- `executed` the actually executed message sent to the server after all transformations and generated HTTP message. See the definition for the `TransportRequest` in the [types definition](https://github.com/advanced-rest-client/arc-types/blob/master/src/request/ArcRequest.d.ts) for more information.
- `context` the execution context (see below)
- `signal` The `AbortSignal` object that should be used to abort the task when requested by the user.

#### Execution context

The context object gives you access to some ARCs APIs and objects that you can use with your logic.

- `eventsTarget` - a DOM node that is used by the application as the primary events target. You can use this node to listen or dispatch events on.
- `Events` - Set when the `events` permission is set. A reference to the [ARC events object](https://github.com/advanced-rest-client/arc-events).
- `environment` - Set when the `environment` permission is set. Contains read only access to the currently selected environment (may be `null` for default) and the list of [variables](https://github.com/advanced-rest-client/arc-types/blob/master/src/models/Variable.d.ts).
- `Store` - Events based access to the ARC's data store. This is set only when `store` permission is set. This is the same as `ArcModelEvents` object defined in [ArcModelEvents.js file](https://github.com/advanced-rest-client/arc-models/blob/stage/src/events/ArcModelEvents.js). Note, `Environment` and `Variable` is removed when `environment` permission is not set.

## For ARC developers

The main class is the `RequestFactory`. It is initialized in the ARC main application (outside the UI app). The main application listens to the request events and calls `processRequest()` or `processResponse()` function depending on the context.

This class is responsible for applying the environment to the request, running request actions, running request modules, and executing the transport.
When the response is ready it executes response actions, response modules, and reports the response back to the UI through the DOM events.

The class itself is registered in the pre-load script of Electron application and therefore has full access to Node.JS APIs. Make sure that none of the Node APIs are not leaking to the modules.

### Default ARC modules

In ARC register its own default modules:

- request
  - `src/modules/RequestAuthorization.js` - Inserts authorization data into the request from the authorization configuration. Requires `['store']` permission.
  - `src/modules/ResponseAuthorization.js` - Handles the response that needs authorization. Renders a dialog for the basics or NTLM authorization methods when needed and re-runs the request. Requires `['store', 'events]` permission.

```javascript
import { RequestFactory, ModulesRegistry, RequestAuthorization, ResponseAuthorization, RequestCookies } from '@advanced-rest-client/request-engine';

ModulesRegistry.register(ModulesRegistry.request, '@advanced-rest-client/request-engine/request/request-authorization', RequestAuthorization, ['store']);
ModulesRegistry.register(ModulesRegistry.response, '@advanced-rest-client/request-engine/response/request-authorization', ResponseAuthorization, ['store', 'events']);
ModulesRegistry.register(ModulesRegistry.request, '@advanced-rest-client/request-engine/request/session-cookies', RequestCookies.processRequestCookies, ['events']);
ModulesRegistry.register(ModulesRegistry.response, '@advanced-rest-client/request-engine/response/session-cookies', RequestCookies.processResponseCookies, ['events']);

const factory = new RequestFactory({ ... });
factory.processRequest({ ... });
```

### UI for modules

The modules cannot import own elements as this most probably will cause a custom elements registry conflicts. However, the modules can use already installed web components. A module can import a module with `import()` function. It cannot use `import xyz` statement as this will register a module from `node_modules` directory instead of `web_modules` used by ARC. When using `import()` function, this happens in the UI thread and the import action is handled by ARC's internal logic to resolve modules.

See `src/modules/ResponseAuthorization.js` for an example of such logic.
