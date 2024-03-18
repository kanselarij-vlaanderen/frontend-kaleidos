'use strict';

module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],
  extends: ['recommended'],
  rules: {
    // We like to handle the most common branch in the first clause, which is
    // why the first clause has a negated condition some times.
    'no-negated-condition': 'off',
    // Temporary rules after updating ember-template-lint and ember-template-lint-plugin-prettier
    'no-redundant-fn': 'off',
    'no-invalid-interactive': 'off',
    'no-quoteless-attributes': 'off',
    'no-unused-block-params': 'off',
    'link-rel-noopener': 'off',
    'no-redundant-role': 'off',
    'require-valid-named-block-naming-format': 'off',
    'no-unsupported-role-attributes': 'off',
    'require-presentational-children': 'off',
  },
};
