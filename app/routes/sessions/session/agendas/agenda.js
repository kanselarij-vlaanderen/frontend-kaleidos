import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		let agenda = this.store.findRecord('agenda', params.agendaid);
		return agenda;
	},

	redirect() {
		this.transitionTo('sessions.session.agendas.agenda.agendaitems');
	},

	actions : {
		lockAgenda(agenda) {
			agenda.set('locked', !agenda.locked);
			agenda.save();
		}
	}
});
