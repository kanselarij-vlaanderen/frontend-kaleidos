import Component from '@ember/component';
import ManageMinisterMixin from 'fe-redpencil/mixins/manage-minister-mixin';

export default Component.extend(ManageMinisterMixin, {
	selectedMandatee: null,

	actions: {
		async mandateeSelected(mandatee) {
			const rowToShow = await this.get('rowToShow');
			if (rowToShow) {
				await Promise.all(rowToShow.domains.map(async (domain) => {
					const domainToClear = await this.store.findRecord('government-domain', domain.id);
					domainToClear.set('selected', false)
				}));
				await Promise.all(rowToShow.fields.map(async (field) => {
					const fieldToClear = await this.store.findRecord('government-field', field.id);
					fieldToClear.set('selected', false)
				}));
			}
			this.set('selectedMandatee', mandatee);
			this.set('rowToShow', (await this.refreshData(mandatee)));
		}

	}
});
