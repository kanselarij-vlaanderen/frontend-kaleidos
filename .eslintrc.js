module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'ember/no-on-calls-in-components': 'off',
    "ember/jquery-ember-run": 'off',
    "ember/avoid-leaking-state-in-ember-objects": 'off',
    "no-invalid-interactive": 'off',
    "no-mixed-spaces-and-tabs": 'off',
    "ember/use-brace-expansion": "off",
    "table-groups":"off",
    "no-triple-curlies":"off",
    "no-console":"off",
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
        'lib/*/index.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      rules: {
        'ember/no-on-calls-in-components': 'off',
        "attribute-indentation": 'off',
        "block-indentation": 'off',
        "no-invalid-interactive": 'off',
        "no-mixed-spaces-and-tabs": 'off',
        "ember/use-brace-expansion": "off",
        "table-groups":"off",
        "no-triple-curlies":"off"
      },
    }
  ]
};
