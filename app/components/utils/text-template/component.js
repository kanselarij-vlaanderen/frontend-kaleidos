import Component from '@ember/component';
import { inject } from '@ember/service';
// import { later } from '@ember/runloop';
import { computed } from '@ember/object';
import ModelSelectorMixin from 'fe-redpencil/mixins/model-selector-mixin';

export default Component.extend(ModelSelectorMixin,{
	classNames: ["vlc-input-field-block"],
	store: inject(),
	searchField: null,
	label: null,
	type: "decisions",
	modelName: "shortcut",
	
	filter: computed('type', function() {
		return {type: this.type};
	}),

	// focusTextarea() {
	// 	later(this, function () {
	// 		let p = document.getElementsByClassName('editor__paper')[0],
	// 			s = window.getSelection(),
	// 			r = document.createRange();
	// 		r.setStart(p, 0);
	// 		r.setEnd(p, 0);
	// 		s.removeAllRanges();
	// 		s.addRange(r);
	// 	}, 250);
	// },

	text: computed('editor.currentTextContent', function () {
		if (!this.editor) {
			return;
		}

		return this.editor.rootNode.innerHTML.htmlSafe();
	}),

	actions: {
		selectModel(items) {
			const richtext = this.editor.rootNode.innerHTML;
			const newText = richtext + items.get('description');
			this.set('text', newText);
		},

		async handleRdfaEditorInit(editorInterface) {
			this.set('editor', editorInterface);
		},
	}
});
