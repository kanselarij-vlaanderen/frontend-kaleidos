import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	store: inject(),
	classNames: ["cases--header-tile", "cases--search"],
	tagName: "div",
	currentCase: null,
	showFilters: false,
	cases: null,

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		this.set('cases', this.store.query('case', {
			filter: {
				title: `${searchValue}`
			}
		}))
	}),

	actions: {
		async chooseCase(caseItem) {
			this.set("currentCase", caseItem);
		},

		resetValue(param) {
			if (param == "") {
				this.set('cases', this.store.query('case', {}));
			}
		}
	}
});
