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
    // moment: {
    //   includeLocales: ['nl'],
    // },
    autoImport: {
      exclude: ['moment-timezone', 'moment', 'ember-moment', 'ember-cli-moment-shim']
    }
  });
  return app.toTree();
};
