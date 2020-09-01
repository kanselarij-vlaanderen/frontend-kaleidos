import Component from '@ember/component';

export default Component.extend({
  classNames: ['vl-editor'],
  classNameBindings: ['isLarge:--large'],

  actions: {
    handleRdfaEditorInit(editorInterface) {
      this.handleRdfaEditorInit(editorInterface);
    },
  },
});
