import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
	currentAgenda: computed('model',  function () {
		let agendas = this.get('model');
		return agendas.get('firstObject');
	}),

	agendaToCompare: computed('currentAgenda', function () {
		let agendas = this.get('model');
		let index = agendas.lastIndexOf(this.get('currentAgenda'));

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
