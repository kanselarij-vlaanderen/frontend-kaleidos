import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	store: inject(),
	classNames: ["cases--header-tile", "cases--search"],
	tagName: "div",
	currentCase: null,

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('case', {
			filter: {
				title: `${searchValue}`
			}
		});
	}),

	actions: {
		async chooseCase(caseItem) {
			let currentCase = await this.store.findRecord('case', caseItem.id, {});
			this.set("currentCase", currentCase);
		},

		resetValue(param) {
			if (param == "") {
				this.set('cases', this.store.query('case', {}));
			}
		}
	}
});
