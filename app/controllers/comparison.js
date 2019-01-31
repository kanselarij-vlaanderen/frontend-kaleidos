import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
	sessionService: inject(),

	// TODO SORT ON DATE FRONTENDSIDE REMOVE ALL CODE!!!

	agendas: alias('sessionService.agendas'),
	currentAgenda: alias('sessionService.currentAgenda'),

	agendaToCompare: computed('currentAgenda', function () {
		let agendas =  this.get('agendas');
		let currentAgenda = this.get('currentAgenda');
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
