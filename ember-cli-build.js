'use strict';

/* eslint-disable */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const webpack = require('webpack');
const compileSass = require('broccoli-sass-source-maps')(require('sass'));

module.exports = async function (defaults) {
  const { setConfig } = await import('@warp-drive/build-config');
  const app = new EmberApp(defaults, {
    autoprefixer: {
      enabled: true,
      cascade: true,
      sourcemap: process.env.DEPLOY_ENV !== 'production',
    },
    sassOptions: {
      extension: 'scss',
      sourceMapEmbed: process.env.DEPLOY_ENV !== 'production',
      includePaths: [
        // 'node_modules/@lblod/ember-rdfa-editor/app/styles/', // as a workaround for https://github.com/ember-cli/ember-cli/issues/8026#issuecomment-420245390
        'node_modules/@appuniversum/ember-appuniversum',
      ],
    },
    flatpickr: {
      locales: ['nl'],
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true,
    },
    'ember-cli-babel': {
      includePolyfill: true,
      plugins: [
        'transform-object-rest-spread',
      ],
    },
    'ember-test-selectors': {
      strip: false
    },
    // polyfill for insecure context (like cypress on jenkins) https://github.com/emberjs/data/tree/v5.0.0?tab=readme-ov-file#randomuuid-polyfill
    '@embroider/macros': {
      setConfig: {
        '@ember-data/store': {
          polyfillUUID: true,
        },
        '@appuniversum/ember-appuniversum': {
          disableInternalAuContentUsage: true,
        },
      },
    },
    autoImport: {
      webpack: {
        plugins: [
          new webpack.ProvidePlugin({
            process: 'process/browser.js',
          }),
        ],
      },
      // exclude: [
      //   'ember-changeset',
      // ],
    },
  });

  setConfig(app, __dirname, {
    polyfillUUID: true
    // WarpDrive/EmberData settings go here (if any)
  });

  app.import('node_modules/sanitize-filename/index.js', {
    using: [
      {
        transformation: 'cjs',
        as: 'sanitize-filename'
      },
    ],
  });

  // instead of using `outputPaths` for building the styleguide CSS (which is deprecated now), we use a fork of `broccoli-sass` to do this
  const styleguideCss = compileSass(
    ['app/styles'],
    'styleguide.scss',
    'assets/styleguide/styleguide.css',
    {
      outputStyle: process.env.DEPLOY_ENV !== 'production' ? 'expanded' : 'compressed',
      sourceMap: process.env.DEPLOY_ENV !== 'production',
      sourceMapEmbed: process.env.DEPLOY_ENV !== 'production'
    }
  );

  return app.toTree([styleguideCss]);
};
