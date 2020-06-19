import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParamsMixin, {
  currentSession: service(),

  creatingNewSession: null,

  actions: {
    createNewSession() {
      this.toggleProperty('creatingNewSession');
    },
    cancelNewSessionForm() {
      this.set('creatingNewSession', false);
    },
    successfullyAdded() {
      this.set('creatingNewSession', false);
      this.send('refreshRoute')
      this.transitionToRoute('agendas.overview');
    }
  }
});
