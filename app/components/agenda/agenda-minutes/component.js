
import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';

export default Component.extend({
	intl: inject(),
	store: inject(),
	agendaService: inject(),

	title: computed('currentSession', function() {
		const date = this.get('currentSession.plannedStart');
		return `${this.get('intl').t('print-notes')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),

	actions: {
		closeModal() {
			this.closeModal();
		}
	},

	async didInsertElement() {
		this._super(...arguments);
		const { currentAgenda, agendaService } = this;
		const sortedAgendaItemIds = await agendaService.getSortedAgendaItems(currentAgenda);
		const sortedAgendaItems = await Promise.all(sortedAgendaItemIds.map((item) => {
				return this.store.peekRecord('agendaitem', item.uuid);
		}));
		this.set('sortedAgendaItems', sortedAgendaItems);
	}
	
});
