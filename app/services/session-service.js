import Service from '@ember/service';
import { computed, observer } from '@ember/object';
import { inject } from '@ember/service';
import { on } from '@ember/object/evented';

export default Service.extend({
	store:inject(),
	currentSession: null,

	agendas: computed('currentSession.agendas.@each', function() {
    if(!this.get('currentSession')){
      return [];
    }
		return this.get('currentSession.agendas').then((agendas) => {
      return agendas.sortBy('name');
    });
	}),

  currentAgendaInitializer: on('init', observer('currentSession', 'agendas.@each', function(){
    if(!this.get('currentSession')){
      this.set('currentAgenda', null);
      return;
    }
    this.get('agendas').then((agendas) => {
      if(agendas.length <= 0){
        this.set('currentAgenda', null);
        return;
      }
      if(!this.get('currentAgenda')){
        this.set('currentAgenda', agendas.objectAt(0));
      }
    });
  })),

	currentAgendaItems: computed('currentAgenda.agendaitems.@each', function() {
		let currentAgenda = this.get('currentAgenda');
		if(currentAgenda) {
			let agendaitems = this.store.query('agendaitem', {
				filter: {
					agenda: { id: currentAgenda.id }
				},
				include:['subcase', 'documents'],
				sort: 'priority'
			});
			return agendaitems;
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
      return agendas.filter(agenda => agenda.name != "Ontwerpagenda");
    });
	})
});
