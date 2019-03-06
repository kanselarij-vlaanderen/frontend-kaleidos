import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	classNames:["people-selector-container"],
	store: inject(),
	selectedPerson: null, 	

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('person', {
			filter: {
				firstName: `${searchValue}`
			}
		});
	}),

	actions: {
		choosePerson(person) {
			this.set('selectedPerson',person)
			this.choosePerson(person);
		},

		resetValueIfEmpty(param) {
			if (param == "") {
				this.set('people', this.store.query('person', {}));
			}
		},
	},

	async didInsertElement() {
		this._super(...arguments);
		const people = await this.store.query('person', {
			sort: "last-name"
		});
		this.set('people', people);
	},

	async loadPeople() {
		
	},
});
