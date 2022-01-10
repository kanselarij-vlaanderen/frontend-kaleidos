/* jshint node:true */

module.exports = function(/* env */) {
  return {
    /**
     * Merges the fallback locale's translations into all other locales as a build-time fallback strategy
     *
     * See: https://ember-intl.github.io/ember-intl/versions/master/docs/guide/addon-configs#fallback-locale
     *
     * @property fallbackLocale
     * @type {String}
     * @default "en-US" (not sure)
     */
    fallbackLocale: 'nl-be',

    /**
     * prevents the translations from being bundled with the application code.
     * This enables asynchronously loading the translations for the active locale
     * by fetching them from the asset folder of the build.
     *
     * See: https://ember-intl.github.io/ember-intl/docs/guide/asynchronously-loading-translations
     *
     * @property publicOnly
     * @type {Boolean}
     * @default "false"
     */
    publicOnly: false,

    /**
     * Path where translations are kept.  This is relative to the project root.
     * For example, if your translations are an npm dependency, set this to:
     *`'./node_modules/path/to/translations'`
     *
     * @property inputPath
     * @type {String}
     * @default "translations"
     */
    inputPath: 'translations',

    /**
     * cause a build error if missing translations are detected.
     *
     * See https://ember-intl.github.io/ember-intl/docs/guide/missing-translations#throwing-a-build-error-on-missing-when-required-translations
     *
     * @property errorOnMissingTranslations
     * @type {Boolean}
     * @default "false"
     */
     errorOnMissingTranslations: false,

    /**
     * filter missing translations to ignore expected missing translations.
     *
     * See https://ember-intl.github.io/ember-intl/docs/guide/missing-translations#requiring-translations
     *
     * @property requiresTranslation
     * @type {Function?}
     * @default "function() { return true; }"
     */
    requiresTranslation(key, locale) {
      // After an ember upgrade, ember-intl was throwing warnings on all keys: "xxx was not found in "en-us""
      if (key.startsWith('en')) {
        // ignore any missing translations for keys starting with 'en'.
        return false;
      }
      if (locale === 'en') {
        // ignore any missing english translations.
        return false;
      }
    },

    /**
     * removes empty translations from the build output.
     *
     * @property stripEmptyTranslations
     * @type {Boolean}
     * @default false
     */
    stripEmptyTranslations: true,
  };
};
