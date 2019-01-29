import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
	queryParams: ['sessionId'],

	agendas: computed('sessionId', function() {
		return this.store.query('agenda', {
			filter: {
				session: { id: this.sessionId }
			},
			sort: '-name'
		})
	}),

	currentAgenda: computed('agendas', async function () {
		let agendas = await this.get('agendas');
		return agendas.get('firstObject');
	}),

	agendaToCompare: computed('currentAgenda', async function () {
		let agendas = await this.get('agendas');
		let currentAgenda = await this.get('currentAgenda');
		let index = agendas.lastIndexOf(currentAgenda);
		if (index >= 0) {
			return agendas.objectAt(index + 1);
		} else {
			return agendas.objectAt(1);
		}
	}),

	actions: {
		selectAgenda(agenda) {
			this.set('currentAgenda', agenda);
		}
	}
});
