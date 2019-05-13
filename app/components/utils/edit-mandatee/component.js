import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getCachedProperty } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend({
	store: inject(),

	item: computed('mandateeToEdit', function () {
		return this.get('caseToEdit');
	}),

	startDate: computed('mandateeToEdit', function () {
		return this.get('mandateeToEdit.start');
	}),

	iseCodes: getCachedProperty('iseCodes'),
	priority: getCachedProperty('priority'),
	title: getCachedProperty('title'),
	shortTitle: getCachedProperty('shortTitle'),

	actions: {
		selectStartDate(val) {
			this.set('startDate', val);
		},

		chooseDomain(iseCodes) {
			this.set('iseCodes', iseCodes);
		},

		closeModal() {
			this.closeModal();
		},

		saveChanges() {
			const { startDate, title, shortTitle, priority, mandateeToEdit, iseCodes } = this;
			const mandatee = this.store.peekRecord('mandatee', mandateeToEdit.get('id'));
			mandatee.set('end', null);
			mandatee.set('title', title);
			mandatee.set('shortTitle', shortTitle);
			mandatee.set('priority', priority);
			mandatee.set('iseCodes', iseCodes)
			mandatee.set('start', startDate);
			mandatee.save().then(() => {
				this.closeModal();
			});
		}
	}
});
