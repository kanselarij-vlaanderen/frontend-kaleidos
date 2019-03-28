import Service from '@ember/service';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Service.extend({
	store:inject(),
	currentSession: null,

	agendas: computed('currentSession.agendas.@each', function() {
    if(!this.get('currentSession')){
      return [];
    }
		return this.get('currentSession.agendas').then((agendas) => {
			return agendas.sortBy('agendaName').reverse();
    });
	}),

	currentAgendaItems: computed('currentAgenda.agendaitems.@each', function() {
		let currentAgenda = this.get('currentAgenda');
		if(currentAgenda) {
			return this.store.query('agendaitem', {
				filter: {
					agenda: { id: currentAgenda.id }
				},
				include:['subcase,subcase.case'],
				sort: 'priority'
			});
		} else {
			return [];
		}
	}),

	announcements: computed('currentAgenda.announcements.@each', function() {
		let currentAgenda = this.get('currentAgenda');
		if(currentAgenda) {
			let announcements = this.store.query('announcement', {
				filter: {
					agenda: { id: currentAgenda.id }
				},
			});
			return announcements;
		} else {
			return [];
		}
	}),

	definiteAgendas: computed('agendas', function() {
		return this.get('agendas').then((agendas) => {
      return agendas.filter(agenda => agenda.name != "Ontwerpagenda").sortBy('-name');
    });
	})
});
