import proxy from 'koa-proxies';
import getPort, {portNumbers} from 'get-port';
import chalk from 'chalk';
import { OAuth2Server } from 'oauth2-mock-server';
import { AuthProxy } from './demo/authorization/AuthProxy.mjs';
import { startServer, stopServer } from './test/WSServer.mjs';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */
/** @typedef {import('@web/dev-server-core').ServerStartParams} ServerStartParams */

const oauth2server = new OAuth2Server();
const authProxy = new AuthProxy();
let oauth2env;
/** @type number */
let wsPort;

/* eslint-disable consistent-return */
export default /** @type DevServerConfig */ ({
  // http2: true,
  // sslKey: 'demo/private.key',
  // sslCert: 'demo/private.pem',
  plugins: [
    {
      name: 'auth',

      /**
       * @param {ServerStartParams} args
       */
      async serverStart(args) {
        const port = await getPort({ port: portNumbers(8000, 8100) });
        const proxyPort = await getPort({ port: portNumbers(8000, 8100) });
        args.app.use(
          proxy('/auth', {
            target: `http://localhost:${port}`,
            // logs: true,
            rewrite: path => path.replace('/auth', ''),
          }),
        );
        const jwtKey = await oauth2server.issuer.keys.generateRSA();
        await oauth2server.start(port, 'localhost');
        await authProxy.start(proxyPort);

        oauth2env = {
          port,
          root: '/auth',
          jwtKey,
          issuer: oauth2server.issuer.url,
          tokenProxy: `http://localhost:${proxyPort}/proxy?u=`
        };

        // 
        // Web sockets
        // 
        wsPort = await getPort({ port: portNumbers(8000, 8100) });
        await startServer(wsPort);
        args.logger.group();
        args.logger.log(`${chalk.white('ws:')} ${chalk.cyanBright(`ws://localhost:${wsPort}`)}`);
        args.logger.groupEnd();
        args.logger.log('');
      },
      
      async serverStop() {
        await oauth2server.stop();
        await authProxy.stop();
        await stopServer();
      },

      serve(context) {
        if (context.path === '/demo/authorization/env.js') {
          const data = {
            oauth2: oauth2env,
          };
          return `export default ${JSON.stringify(data)}`;
        }
        if (context.path === '/demo/ws/env.js') {
          return `export default { port: "${wsPort}" }`;
        }
        if (context.path === '/demo/env.js') {
          return `export default ${JSON.stringify(process.env)}`;
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
