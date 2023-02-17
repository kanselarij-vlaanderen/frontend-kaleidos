// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['vl-uploaded-document'],

  // Properties
  name: null,
  extension: null,
  size: null,
  downloadLink: null, // or 'download' action
  downloadName: null, // Optional

  // Actions (all optional. buttons are are not rendered when not available)
  view: null,
  download: null, // overrides use of 'downloadLink' property
  delete: null,

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    view() {
      if (this.view) {
        this.view(...arguments);
      }
    },

    download() {
      if (this.download) {
        this.download(...arguments);
      }
    },

    delete() {
      if (this.delete) {
        this.delete(...arguments);
      }
    },
  },
});
