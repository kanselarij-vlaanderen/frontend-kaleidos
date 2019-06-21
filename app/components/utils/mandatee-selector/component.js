import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { filter } from '@ember/object/computed';
import moment from 'moment';

export default Component.extend({
	classNames: ["mandatee-selector-container"],
	store: inject(),
	selectedMandatees: null,
	singleSelect: false,

	searchMandatee: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('mandatee', {
			filter: {
				title: searchValue
			},
			sort: 'priority'
		});
	}),

	mandatees: computed("store", function () {
		return this.store.findAll('mandatee', { sort: 'priority', include: 'person' });
	}),

	filteredMandatees: filter('mandatees.@each', function (mandatee) {
		if (!mandatee.end || (moment(mandatee.end).utc().toDate() > moment().utc().toDate())) {
			if (moment(mandatee.start).utc().toDate() < (moment().utc().toDate())) {
				return mandatee;
			}
		}
	}),

	actions: {
		async chooseMandatee(mandatees) {
			this.set('selectedMandatees', mandatees);
			this.chooseMandatee(mandatees);
		},
		async resetValueIfEmpty(param) {
			if (param === "") {
				this.set('mandatees', this.store.findAll('mandatee', { sort: 'priority', include: 'person' }));
			}
		}
	}
});
