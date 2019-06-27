import Component from '@ember/component';
import DocumentsSelectorMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { computed } from '@ember/object';

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

	didInsertElement() {
		// Make sure that the view scrolls to the center of this component
		this._super(...arguments);
		const config = { behavior: "smooth", block: "end", inline: "nearest" };
		const elements = document.getElementsByClassName("vl-form__group vl-u-bg-porcelain");
		elements[0].scrollIntoView(config);
	},

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
