import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	classNames: ["mandatee-container"],
	selectedMandatee: null,

	searchMandatee: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('mandatee', {
			filter: {
				title: searchValue 
			}
		});
	}),

	mandatees: computed("store", function () {
		return this.store.findAll('mandatee');
	}),

	actions: {
		async chooseMandatee(mandatees) {
			this.set('selectedMandatee', mandatees)
			this.chooseMandatee(mandatees);
		},
		async resetValueIfEmpty(param) {
			if (param === "") {
				this.set('mandatees', this.store.findAll('mandatee'));
			}
		}
	}
});
