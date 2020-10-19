module.exports = {
  extends: 'recommended',

  rules: {
    'no-bare-strings': true,
    'attribute-indentation': {
      indentation: 2,
    },
    'no-inline-styles': false,
    'block-indentation': {
      indentation: 2,
      ignoreComments: true,
    },
    quotes: false,
    'no-unnecessary-concat': false,
    'no-nested-interactive': false,
    'self-closing-void-elements': false,
    'no-invalid-interactive': false,
    'no-negated-condition': false,
    'simple-unless': false,
  },

  ignore: [
    'addon/**'
  ],
};
