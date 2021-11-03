/** @typedef {import('@web/dev-server').DevServerConfig} DevServerConfig */

export default /** @type DevServerConfig */ ({
  plugins: [
    {
      name: 'env',

      serve(context) {
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
