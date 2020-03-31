import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
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
