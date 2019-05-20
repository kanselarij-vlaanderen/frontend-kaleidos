import Component from '@ember/component';
import { inject } from '@ember/service';
import { later } from '@ember/runloop';
// import { task, timeout } from 'ember-concurrency';
// import { computed } from '@ember/object';
import $ from 'jquery';
/**
 * LEAVE THE COMMENTS IN THIS CODE TO SPEED UP THE NEXT TICKETS 
 */
export default Component.extend({
	classNames: ["vlc-input-field-block"],
	store: inject(),
	searchField: null,
	propertyToShow: null,
	rows: "5",
	text: null,
	label: null,

	focusTextarea() {
		later(this, function () {
			document.getElementById('toFocus').focus();
		}, 250);
	},

	actions: {
		selectModel(items) {
			const text = this.get('text');
			const textToAdd = items.description;
			let newText;
			if (text != "") {
				newText = text + " " + textToAdd;
			} else {
				newText = textToAdd;
			}
			this.set('text', newText);
			this.focusTextarea();
		},

		async resetValueIfEmpty(param) {
			if (param == "") {
				let textTemplates = await $.getJSON("/utils/text-templates.json");
				this.set('items', textTemplates.textTemplates);
			}
		},
	},

	async didInsertElement() {
		this._super(...arguments);
		let textTemplates = await $.getJSON("/utils/text-templates.json");
		this.set('items', textTemplates.textTemplates);
	}
});
