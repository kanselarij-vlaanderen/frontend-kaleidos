import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-editor'],
  classNameBindings: ['isLarge:--large'],
  isLarge: null,

  actions: {
    handleRdfaEditorInit(editorInterface) {
      this.handleRdfaEditorInit(editorInterface);
    },
  },
});
