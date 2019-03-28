import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	store:inject(),

	startDate: computed('mandateeToEdit', function() {
		return this.get('mandateeToEdit.start');
	}),

	priority: computed('mandateeToEdit', {
		get() {
			const mandatee = this.get('mandateeToEdit');
			if (mandatee) {
				return mandatee.get('priority');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	title: computed('mandateeToEdit', {
		get() {
			const mandatee = this.get('mandateeToEdit');
			if (mandatee) {
				return mandatee.get('title');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	shortTitle: computed('mandateeToEdit', {
		get() {
			const mandatee = this.get('mandateeToEdit');
			if (mandatee) {
				return mandatee.get('shortTitle');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	actions: {
		selectStartDate(val) {
			this.set('startDate', val);
		},

		chooseDomain(domains) {
			this.set('selectedDomains', domains);
		},

		closeModal() {
			this.closeModal();
		},

		saveChanges() {
			const { startDate, title, shortTitle, priority, mandateeToEdit } = this;
			const mandatee = this.store.peekRecord('mandatee', mandateeToEdit.get('id'));
			mandatee.set('end', null);
			mandatee.set('title', title);
			mandatee.set('shortTitle', shortTitle);
			mandatee.set('priority', priority);
			mandatee.set('start', startDate);
			mandatee.save().then(() => {
				this.closeModal();
			});
		}
	}
});
