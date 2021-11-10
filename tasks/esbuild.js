/* eslint-disable import/no-extraneous-dependencies */
const esbuild = require('esbuild');

esbuild
    .build({
        entryPoints: ['index.js'],
        outdir: 'build',
        bundle: true,
        sourcemap: true,
        minify: true,
        splitting: true,
        format: 'esm',
        target: ['esnext']
    })
    .catch(() => process.exit(1));
