import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ["vl-u-spacer"],
	store: inject(),
	title: computed('selectedDomain', function () {
		const domain = this.get('selectedDomain');
		if (domain) {
			return domain.get('label');
		} else {
			return null;
		}
	}),
	isAdding: false,
	isEditing: false,

	actions: {
		closeModal() {
			this.closeModal();
		},

		selectDomain(domain) {
			this.set('selectedDomain', domain);
		},

		toggleIsAdding() {
			this.toggleProperty('isAdding');
		},

		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},

		removeMandate() {
			const domainToDelete = this.get('selectedDomain');
			if (!domainToDelete) {
				return;
			}
			domainToDelete.destroyRecord();
			this.set('selectedDomain', null);
		},

		editMandatee() {
			const domain = this.get('selectedDomain');
			domain.set('label', this.get('title'));
			domain.save().then(() => {
				this.set('title', null);
				this.toggleProperty('isEditing');
			});
		},

		createMandate() {
			const governmentDomain = this.store.createRecord('government-domain', {
				label: this.get('title')
			});
			governmentDomain.save().then(() => {
				this.set('title', null);
				this.set('isAdding', false);
			});
		}
	}
});
