/* eslint-disable consistent-return */
import { ApiRoutes } from '@api-components/amf-web-api/src/ApiRoutes.js';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */
/** @typedef {import('@web/dev-server-core').ServerStartParams} ServerStartParams */

// /** @type number */
// let amfParserPort;

export default /** @type DevServerConfig */ ({
  plugins: [
    {
      name: 'env',

      /**
       * @param {ServerStartParams} args
       */
      async serverStart(args) {
        // amfParserPort = await getPort({ port: portNumbers(8000, 8100) });
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
              // hostname: `${context.hostname}:${amfParserPort}`,
              // port: amfParserPort,
              path: '/api/v1',
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
