import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  intl: inject(),

  classNames: ['vl-description-data', 'auk-u-mb-4', 'auk-u-mt-8'],

  downloadUrl: computed('signature.file', function() {
    return this.signature.then((signature) => signature.get('file').then((file) => `/files/${file.get('id')}/download`));
  }),

  nameToDisplay: computed('signature.name', function() {
    return this.signature.then((signature) => `${signature.name}${this.intl.t('divider')}`);
  }),

  functionToDisplay: computed('signature.function', function() {
    return this.signature.then((signature) => `${signature.function}.`);
  }),
});
