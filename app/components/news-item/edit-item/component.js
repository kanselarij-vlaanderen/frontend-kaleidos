import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

export default Component.extend(DocumentsSelectorMixin, {
	classNames: ["vl-form__group vl-u-bg-porcelain"],
	propertiesToSet: ['finished', 'subtitle', 'title', 'text', 'richtext'],
	isExpanded: false,
	subtitle: getCachedProperty('subtitle'),
	text: getCachedProperty('text'),
	title: getCachedProperty('title'),
	finished: getCachedProperty('finished'),

	themes: computed('agendaitem.themes', function () {
		return this.get('agendaitem.themes').then((themes) => {
			return themes;
		});
	}),

	richtext: computed('editor.currentTextContent', function () {
		if (!this.editor) {
			return;
		}
		return this.editor.rootNode.innerHTML.htmlSafe();
	}),

	actions: {
		async handleRdfaEditorInit(editorInterface) {
			this.set('editor', editorInterface);
		},
		expandEditor() {
			this.set('isExpanded', true);
		},
		chooseTheme(themes) {
			this.set('themes', themes);
		}
	}
});
