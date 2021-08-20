'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended', /*'ember-template-lint-plugin-prettier:recommended'*/],
  rules: {
    // We like to handle the most common branch in the first clause, which is
    // why the first clause has a negated condition some times.
    'no-negated-condition': 'off',
    'no-curly-component-invocation': {
      allow: ['subcase-timeline-item-text'], // a helper
    },
  },
};
