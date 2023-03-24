'use strict';

module.exports = {
  singleQuote: true,
  overrides: [
    // https://dev.to/jelhan/format-glimmer-templates-with-prettier-ipa
    {
      files: '*.hbs',
      options: {
        // parser: 'glimmer',
        singleQuote: false,
      },
    },
  ],
};
