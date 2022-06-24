/* eslint-disable consistent-return */
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { ApiRoutes } from '@api-components/amf-web-api/src/ApiRoutes.js';
import { ApiRoutes as ProxyRoutes } from '@advanced-rest-client/arc-proxy/src/ApiRoutes.js';
import chalk from 'chalk';
import getPort, {portNumbers} from 'get-port';
import { startServer, stopServer } from './test/ExchangeApi.mjs';

/** Use Hot Module replacement by adding --hmr to the start command */
const hmr = process.argv.includes('--hmr');

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */
/** @typedef {import('@web/dev-server-core').ServerStartParams} ServerStartParams */

/** @type number */
let exchangeApiPort;

export default /** @type DevServerConfig */ ({
  open: '/demo/',
  /** Use regular watch mode if HMR is not enabled. */
  watch: !hmr,

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  // mimeTypes: {
  //   // serve all json files as js
  //   // '**/*.json': 'js',
  //   // serve .module.css files as js
  //   '**/monaco-editor/esm/vs/editor/standalone/**/.css': 'js',
  // },

  /** Set appIndex to enable SPA routing */
  // appIndex: 'demo/index.html',

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto'

  plugins: [
    esbuildPlugin({ ts: true, target: 'es2020' }),
    
    {
      name: 'env',
      /**
       * @param {ServerStartParams} args
       */
      async serverStart(args) {
        const proxyHandler = new ProxyRoutes();
        const proxyRouter = proxyHandler.setup('/proxy/v1');
        args.app.use(proxyRouter.routes());
        args.app.use(proxyRouter.allowedMethods());

        const handler = new ApiRoutes();
        const apiRouter = handler.setup('/api/v1');
        args.app.use(apiRouter.routes());
        args.app.use(apiRouter.allowedMethods());
      },

      /**
       * @param {ServerStartParams} args
       */
      serve(context) {
        if (context.path === '/demo/env.js') {
          const env = {
            variables: process.env,
            amfService: {
              path: '/api/v1',
            },
          };
          return `export default ${JSON.stringify(env)}`;
        }
      },
    },

    {
      name: 'mock-api',

      serve(context) {
        if (context.path === '/demo/env.js') {
          const data = {
            exchangeApiPort,
          };
          return `export default ${JSON.stringify(data)}`;
        }
        return undefined;
      },

      /**
       * @param {ServerStartParams} args
       */
      async serverStart(args) {
        exchangeApiPort = await getPort({ port: portNumbers(8000, 8100) });
        await startServer(exchangeApiPort);
        args.logger.group();
        args.logger.log(`${chalk.white('Exchange API:')} ${chalk.cyanBright(`http://localhost:${exchangeApiPort}`)}`);
        args.logger.groupEnd();
        args.logger.log('');
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
});
