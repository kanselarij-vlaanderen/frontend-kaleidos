import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';

export default Mixin.create({
  isExpanded: false,

  richtext: computed('editor.currentTextContent', function () {
    if (!this.editor) {
      return;
    }
    return this.editor.rootNode.innerHTML.htmlSafe();
  }),

  actions: {
    expandEditor() {
      this.set('isExpanded', true);
    },

    async handleRdfaEditorInit(editorInterface) {
      this.set('editor', editorInterface);
    },
    descriptionUpdated(val) {
      this.set('initValue', this.richtext + val);
    },
  },
});
