import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	richText: computed('editor.rootNode.innerHTML', function() {
		return this.editor.rootNode.innerHTML;
	}),

	actions: {
		handleRdfaEditorInit(editorInterface) {
			this.set('editor', editorInterface);
		}
	}
});
