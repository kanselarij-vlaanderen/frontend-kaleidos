import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Controller.extend({
	sessionService: inject(),
	currentAgenda: alias('sessionService.currentAgenda'),
	currentSession: alias('sessionService.currentSession'),

	actions: {
		refresh() {
			const { currentAgenda, currentSession } = this;
			console.log('hey')
			this.transitionToRoute('agenda.agendaitems', currentSession.id, { queryParams: { selectedAgenda: currentAgenda.id } });
		}
	}
});
