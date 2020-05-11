'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    autoprefixer: {
      enabled: true,
      cascade: true,
      sourcemap: true
    },
    sassOptions: {
      extension: 'scss',
      sourceMapEmbed: true
    },
    flatpickr: {
      locales: ['nl']
    },
    moment: {
      outputFormat: 'L',
      allowEmpty: true
    },

    'ember-cli-babel': {
      includePolyfill: true,
      plugins: [
        'transform-object-rest-spread'
      ]
    },
    'ember-test-selectors': {
      strip: false
    }
  });

  app.import('node_modules/sanitize-filename/index.js', {
    using: [
      { transformation: 'cjs', as: 'sanitize-filename' }
    ]
  });

  return app.toTree();
};
