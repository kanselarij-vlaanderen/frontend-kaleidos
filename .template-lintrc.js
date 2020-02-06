'use strict';

module.exports = {
  extends: 'recommended',

  rules: {
    "no-bare-strings": true,
    "attribute-indentation": false,
    "no-inline-styles": false,
    "block-indentation": false,
    "quotes": false,
    "no-unnecessary-concat": false,
    "no-nested-interactive":false,
    "self-closing-void-elements":false,
    "no-invalid-interactive":false
  },

  ignore: [
    'addon/**'
  ]
};
