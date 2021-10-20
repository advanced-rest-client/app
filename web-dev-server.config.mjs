import proxy from 'koa-proxies';
import getPort, {portNumbers} from 'get-port';
import { OAuth2Server } from 'oauth2-mock-server';
import { AuthProxy } from './demo/authorization/AuthProxy.mjs';

/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

const oauth2server = new OAuth2Server();
const authProxy = new AuthProxy();
let oauth2env;

/* eslint-disable consistent-return */
export default /** @type DevServerConfig */ ({
  // http2: true,
  // sslKey: 'demo/private.key',
  // sslCert: 'demo/private.pem',
  plugins: [
    {
      name: 'auth',
      async serverStart({ app }) {
        const port = await getPort({ port: portNumbers(8000, 8100) });
        const proxyPort = await getPort({ port: portNumbers(8000, 8100) });
        app.use(
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
      },
      
      async serverStop() {
        await oauth2server.stop();
        await authProxy.stop();
      },

      serve(context) {
        if (context.path === '/demo/authorization/env.js') {
          const data = {
            oauth2: oauth2env,
          };
          return `export default ${JSON.stringify(data)}`;
        }
      },
    },
  ],
});
