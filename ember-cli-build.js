/* eslint-disable */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    autoprefixer: {
      enabled: true,
      cascade: true,
      sourcemap: process.env.DEPLOY_ENV !== 'production',
    },
    sassOptions: {
      extension: 'scss',
      sourceMapEmbed: process.env.DEPLOY_ENV !== 'production',
    },
    flatpickr: {
      locales: ['nl'],
    },
    moment: {
      outputFormat: 'L',
      allowEmpty: true,
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
  });

  app.import('node_modules/sanitize-filename/index.js', {
    using: [
      {
        transformation: 'cjs',
        as: 'sanitize-filename'
      },
    ],
  });

  app.import('node_modules/@kanselarij-vlaanderen/au-kaleidos-icons/iconfont/icons.css'); // imported to /assets by default
  app.import('node_modules/@kanselarij-vlaanderen/au-kaleidos-icons/iconfont/icons.woff2', {
    destDir: 'assets' // font files need to be next to their css file, because the css font-file references them hardcoded
  });
  app.import('node_modules/@kanselarij-vlaanderen/au-kaleidos-icons/iconfont/icons.woff', {
    destDir: 'assets' // font files need to be next to their css file, because the css font-file references them hardcoded
  });
  app.import('node_modules/@kanselarij-vlaanderen/au-kaleidos-icons/iconfont/icons.ttf', {
    destDir: 'assets' // font files need to be next to their css file, because the css font-file references them hardcoded
  });

  return app.toTree();
};
