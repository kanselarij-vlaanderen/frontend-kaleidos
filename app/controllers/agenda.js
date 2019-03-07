import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';

export default Controller.extend(DefaultQueryParamsMixin, {
	sessionService: inject(),
	creatingNewSession: false,

	actions: {
		selectAgenda(meeting) {
			this.set('sessionService.currentSession', meeting);
			this.transitionToRoute('agendas');
		},
		createNewSession() {
			this.toggleProperty('creatingNewSession');
		}, 
		cancelNewSessionForm() {
			this.set('creatingNewSession', false);
			this.refresh();
		},
	},

	mergeQueryOptions() {
    return { included: 'agendas' };
  }});
