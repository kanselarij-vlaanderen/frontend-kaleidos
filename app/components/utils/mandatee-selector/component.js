import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { filter } from '@ember/object/computed';

export default Component.extend({
	classNames: ["mandatee-selector-container"],
	store: inject(),
	selectedMandatees: null,
	singleSelect:false,

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

	filteredMandatees: filter('mandatees.@each', function(mandatee) {
		if(!mandatee.end || (new Date(mandatee.end) > new Date())) {
			if(new Date(mandatee.start) < (new Date())) {
				return mandatee;
			}
		}
	}),

	actions: {
		async chooseMandatee(mandatees) {
			this.set('selectedMandatees', mandatees)
			this.chooseMandatee(mandatees);
		},
		async resetValueIfEmpty(param) {
			if (param === "") {
				this.set('mandatees', this.store.findAll('mandatee'));
			}
		}
	}
});
