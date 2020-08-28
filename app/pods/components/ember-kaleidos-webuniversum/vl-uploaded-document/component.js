import Component from '@ember/component';

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
