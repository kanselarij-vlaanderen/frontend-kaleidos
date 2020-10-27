/* eslint-disable */
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
    'hbs'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
  env: {
    browser: true,
  },
  rules: {
    'ember/no-jquery': 'warn',
    'ember/no-observers': 'warn',
    'ember/no-new-mixins': 'warn',
    'no-underscore-dangle': 'off',
    'prefer-rest-params': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'max-len': 'off',
    'no-plusplus': 'off',
    'func-names': 'off',
    "prefer-const": ["error", {
      "destructuring": "any",
      "ignoreReadBeforeAssign": false
    }],
    "no-const-assign": ["error"],
    "no-var": "error",
    "no-new-object": "error",
    "object-shorthand": "off",
    "quote-props": ["error", "as-needed"],
    "no-prototype-builtins": "error",
    "no-array-constructor": "error",
    "prefer-destructuring": "off",
    "quotes": [ "error", "single", { "avoidEscape": true }],
    "prefer-template": "error",
    "template-curly-spacing": ["error", "never"],
    "no-eval": 'error',
    'no-useless-escape': 'error',
    "func-style": ["off", "expression", { "allowArrowFunctions": true }],
    "wrap-iife": "error",
    "no-loop-func": "error",
    "no-new-func": "error",
    "space-before-function-paren": ["error", "never"],
    "space-before-blocks": ["error", {"functions": "always", "keywords": "always", "classes": "always"}],
    'no-param-reassign': 'warn',
    "prefer-spread": "error",
    "function-paren-newline": "off",
    "prefer-arrow-callback": "error",
    "arrow-spacing": ["error", {"before": true, "after": true}],
    "arrow-parens": ["error", "always"],
    "arrow-body-style": ["error", "as-needed"],
    "no-confusing-arrow": ["error", {"allowParens": true}],
    "implicit-arrow-linebreak": ["error", "beside"],
    "no-useless-constructor": "error",
    "no-dupe-class-members": "error",
    "no-duplicate-imports": ["error", { "includeExports": true }],
    "object-curly-newline": ["error", {
      "ObjectExpression": {"multiline": true, "minProperties": 1},
      "ObjectPattern": { "multiline": true, "minProperties": 1 },
      "ImportDeclaration": {"multiline": true, "minProperties": 2 },
      "ExportDeclaration": { "multiline": true, "minProperties": 1 }
    }],
    "no-iterator": "error",
    "no-restricted-syntax": "error",
    "generator-star-spacing": "error", // Als we de no-iterator (generators) manueel disablen dan zorgt deze ervoor dat de syntax wel goed is, anders kan dit issues geven bij ES5 transpiling
    "dot-notation": ["error", { "allowKeywords": true }], // voor keywords moet je de ["keyword"] notatie gebruiken
    "no-restricted-properties": "error",
    "no-undef": ["error", {"typeof": true}],
    "one-var": ["error", "never"],
    "no-multi-assign": "error",
    "operator-linebreak": ["error", "before"],
    "no-unused-vars": ["error", {
      "vars": "all",
      "args": "all",
      "ignoreRestSiblings": false,
      "caughtErrors": "all"
    }],
    "eqeqeq": ["error", "always"],
    "no-case-declarations": "error",
    "no-nested-ternary": "error",
    "no-unneeded-ternary": "error",
    "no-mixed-operators": "error",
    "curly": ["error", "all"],
    "nonblock-statement-body-position": "off",
    "brace-style": ["error", "1tbs"],
    "no-else-return": "error",
    "spaced-comment": ["error", "always"],
    "indent": ["error", 2, {
      "SwitchCase": 1
    }],
    "keyword-spacing": ["error", { "before": true, "after": true }],
    "space-infix-ops": "error",
    "eol-last": ["error"],
    "newline-per-chained-call": ["error", {"ignoreChainWithDepth": 2}], // 2 is de default
    "no-whitespace-before-property": "error",
    "padded-blocks": ["error", "never"],
    "no-multiple-empty-lines": "error",
    "space-in-parens": ["error", "never"],
    "array-bracket-spacing": ["error", "never"],
    "object-curly-spacing": ["error", "always"],
    "block-spacing": ["error", "always"],
    "comma-spacing": ["error", { "before": false, "after": true }],
    "computed-property-spacing": ["error", "never"],
    "func-call-spacing": ["error", "never"],
    "key-spacing": ["error", { "beforeColon": false, "afterColon": true, "mode": "strict" }],
    "no-trailing-spaces": "error",
    "comma-style": ["error", "last"],
    "comma-dangle": ["error", {
      "arrays": "never",
      "objects": "always",
      "imports": "never",
      "exports": "never",
      "functions": "never" // Ik vind het er achter het laatste functie argument maar lelijk uitzien
    }],
    "semi": ["error", "always"],
    "no-new-wrappers": "error",
    "radix": ["error", "always"],
    "id-length": ["error", {
      "min": 2,
      "properties":"always",
    }],
    "camelcase": ["error", {
      "properties": "always",
      "allow": [

      ]
    }],
    "new-cap": ['warn', {
      'capIsNewExceptions': ['A']
    }],
    "no-restricted-globals": ["error"]
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
    },
  ],
};
