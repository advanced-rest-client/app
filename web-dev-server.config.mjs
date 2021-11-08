/* eslint-disable consistent-return */
import { ApiRoutes } from '@api-components/amf-web-api/src/ApiRoutes.js';
import getPort, {portNumbers} from 'get-port';
import pkg from './demo/proxy/Server.js';

const { ProxyServer } = pkg;

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */
/** @typedef {import('@web/dev-server-core').ServerStartParams} ServerStartParams */

/** @type number */
let proxyPort;

const proxyServer = new ProxyServer();

export default /** @type DevServerConfig */ ({
  plugins: [
    {
      name: 'env',
      /**
       * @param {ServerStartParams} args
       */
      async serverStart(args) {
        proxyPort = await getPort({ port: portNumbers(8000, 8100) });
        const handler = new ApiRoutes();
        const apiRouter = handler.setup('/api/v1');
        args.app.use(apiRouter.routes());
        args.app.use(apiRouter.allowedMethods());
        await proxyServer.start(proxyPort);
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
            httpProxy: {
              port: proxyPort,
              base: `//localhost:${proxyPort}/proxy?u=`,
            },
          };
          return `export default ${JSON.stringify(env)}`;
        }
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
