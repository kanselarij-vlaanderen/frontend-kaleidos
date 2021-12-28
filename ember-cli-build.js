/* eslint-disable */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const Funnel = require('broccoli-funnel');

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
      includePaths: [
        'node_modules/@kanselarij-vlaanderen/au-kaleidos-css/',
        'node_modules/@lblod/ember-rdfa-editor/app/styles/', // as a workaround for https://github.com/ember-cli/ember-cli/issues/8026#issuecomment-420245390
      ],
    },
    flatpickr: {
      locales: ['nl'],
    },
    moment: {
      outputFormat: 'L',
      allowEmpty: true,
    },
    outputPaths: {
      app: {
        css: {
          'styleguide': '/assets/styleguide.css'
        }
      }
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

  app.import('node_modules/@kanselarij-vlaanderen/au-kaleidos-icons/iconfont/icons.css');

  const iconAssets = new Funnel('node_modules/@kanselarij-vlaanderen/au-kaleidos-icons', {
    srcDir: '/iconfont',
    include: ['*.woff2', '*.woff', '*.ttf'],
    destDir: '/assets'
  });

  const fontAssets = new Funnel('node_modules/@kanselarij-vlaanderen/au-kaleidos-css', {
    srcDir: '/fonts',
    include: ['*.woff2', '*.woff'],
    destDir: '/assets/fonts'
  });

  return app.toTree([iconAssets, fontAssets]);
};
