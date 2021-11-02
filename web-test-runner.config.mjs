import { OAuth2Server } from 'oauth2-mock-server';
import getPort, {portNumbers} from 'get-port';
import { startServer, stopServer } from './test/WSServer.mjs';

/** @typedef {import('@web/test-runner').TestRunnerConfig} TestRunnerConfig */

const oauth2server = new OAuth2Server();
let oauth2env;
/** @type number */
let wsPort;

export default /** @type TestRunnerConfig */ ({
  files: 'test/**/*.test.js',
  // files: 'test/variables/*.test.js',
  nodeResolve: true,
  concurrency: 1,
  testFramework: {
    config: {
      timeout: 5000,
    }
  },
  plugins: [
    {
      name: 'mock-api',
      serve(context) {
        if (context.path === '/test/env.js') {
          const data = {
            oauth2: oauth2env,
          };
          return `export default ${JSON.stringify(data)}`;
        }
        if (context.path === '/empty-response') {
          return '';
        }
        if (context.path === '/test/ws/env.js') {
          return `export default { port: "${wsPort}" }`;
        }
        return undefined;
      },
    },

    // servers
    {
      name: 'servers',
      async serverStart() {
        const port = await getPort({ port: portNumbers(8000, 8100) });
        const jwtKey = await oauth2server.issuer.keys.generateRSA();
        await oauth2server.start(port, 'localhost');
        oauth2env = {
          port,
          jwtKey,
          issuer: oauth2server.issuer.url,
        };
        wsPort = await getPort({ port: portNumbers(8000, 8100) });
        await startServer(wsPort);
      },

      async serverStop() {
        await oauth2server.stop();
        await stopServer();
      },
    },
  ],

  testRunnerHtml: testFramework =>
  `<html>
    <body>
      <script src="dev/jexl.window.js"></script>
      <script type="module" src="${testFramework}"></script>
    </body>
  </html>`,
})
