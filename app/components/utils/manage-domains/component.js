import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
	store:inject(),
	title:null,
	isAdding:false,

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

		removeMandate() {
			const domainToDelete = this.get('selectedDomain');
			if(!domainToDelete) {
				return;
			}
			domainToDelete.destroyRecord();
			this.set('selectedDomain', null);
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
