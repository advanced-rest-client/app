import { esbuildPlugin } from '@web/dev-server-esbuild';
import getPort, {portNumbers} from 'get-port';
import { startServer, stopServer } from './test/ExchangeApi.mjs';

/** @typedef {import('@web/test-runner').TestRunnerConfig} TestRunnerConfig */

/** @type number */
let exchangeApiPort;

export default /** @type TestRunnerConfig */ ({
  /** Test files to run */
  files: 'test/**/**/*.test.ts',
  
  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'production'],
  },

  /** Filter out lit dev mode logs */
  filterBrowserLogs(log) {
    for (const arg of log.args) {
      if (typeof arg === 'string' && filteredLogs.some(l => arg.includes(l))) {
        return false;
      }
    }
    return true;
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Amount of browsers to run concurrently */
  concurrentBrowsers: 3,

  /** Amount of test files per browser to test concurrently */
  concurrency: 1,

  testFramework: {
    config: {
      timeout: 5000,
    }
  },

  /** Browsers to run tests on */
  // browsers: [
  //   playwrightLauncher({ product: 'chromium' }),
  //   playwrightLauncher({ product: 'firefox' }),
  //   playwrightLauncher({ product: 'webkit' }),
  // ],

  plugins: [
    esbuildPlugin({ ts: true, target: 'es2020' }),
    {
      name: 'mock-api',
      serve(context) {
        if (context.path === '/test/env.js') {
          const data = {
            exchangeApiPort,
          };
          return `export default ${JSON.stringify(data)}`;
        }
        return undefined;
      },

      async serverStart() {
        exchangeApiPort = await getPort({ port: portNumbers(8000, 8100) });
        await startServer(exchangeApiPort);
      },

      async serverStop() {
        await stopServer();
      },
    },
  ],

  middleware: [
    function rewriteIndex(context, next) {
      const isThemes = context.url.startsWith('/demo/themes/');
      const isFonts = isThemes && context.url.includes('/fonts/');
      if (isThemes && !isFonts) {
        const newLocation = context.url.replace('@advanced-rest-client/', '');
        context.url = `${newLocation}.css`;
      } else if (isFonts) {
        const newLocation = context.url.replace(/@advanced-rest-client\/[^/]+\//, '');
        context.url = newLocation;
      }

      return next();
    },
  ],

  testRunnerHtml: testFramework =>
  `<html>
    <body>
      <script type="module" src="${testFramework}"></script>
    </body>
  </html>`,
})
