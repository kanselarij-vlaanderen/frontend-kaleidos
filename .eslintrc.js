module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: [
    'ember',
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'airbnb',
  ],
  env: {
    browser: true,
  },
  rules: {
    'ember/no-jquery': 'error',
    'ember/no-observers': 'warn',
    'ember/no-new-mixins': 'warn',
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'prefer-rest-params': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'max-len': 'warn',
    'react/prefer-stateless-function': 'off',
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/*/index.js',
        'server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      rules: {
        'ember/no-on-calls-in-components': 'off',
        'attribute-indentation': 'off',
        'block-indentation': 'off',
        'no-invalid-interactive': 'off',
        'no-mixed-spaces-and-tabs': 'off',
        'ember/use-brace-expansion': 'off',
        'table-groups': 'off',
        'no-triple-curlies': 'off',
      },
    },
  ],
};
