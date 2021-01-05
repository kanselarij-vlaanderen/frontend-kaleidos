import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-col--4-4 vl-spacer-box auk-u-mt-2'],

  actions: {
    removeDocument(document) {
      this.removeDocument(document);
    },
  },
});
