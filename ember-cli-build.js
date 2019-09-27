'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    sassOptions: {
      extension: 'scss'
    },
    flatpickr: {
      locales: ['nl']
    },
    moment: {
      outputFormat: 'L',
      allowEmpty: true
    }
  });

  app.import('node_modules/sanitize-filename/index.js', {
    using: [
      { transformation: 'cjs', as: 'sanitize-filename' }
    ]
  });
  
  return app.toTree();
};
