import Component from '@ember/component';
import { inject } from '@ember/service';
// import { later } from '@ember/runloop';
import { task, timeout } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ["vlc-input-field-block"],
	store: inject(),
	searchField: null,
	label: null,
	type: "decisions",
	modelName: "shortcut",

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

	findAll: task(function* () {
		const { modelName } = this;
			const items = yield this.store.query(modelName, { filter: { type: this.type } });
			this.set('items', items);
	}),

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		const { searchField, modelName } = this;
		let filter = {};

		filter[searchField] = searchValue;
		return this.store.query(modelName, {
			filter: filter,
		});
	}),
	actions: {
		selectModel(items) {
			const richtext = this.editor.rootNode.innerHTML;
			const newText = richtext + items.get('description');
			this.set('text', newText);
		},

		async resetValueIfEmpty(param) {
			if (param == "") {
				this.searchTask.perform(param);
			}
		},

		async handleRdfaEditorInit(editorInterface) {
			this.set('editor', editorInterface);
		},
	},

	async didInsertElement() {
		this._super(...arguments);
		this.findAll.perform();
	}
});
