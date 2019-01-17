import Controller from '@ember/controller';

export default Controller.extend({
  selectedAgenda: null,
  currentCase: null,
  addingSubCasesToAgenda: false,
  creatingNewSession: false,

  actions: {
    cancelNewSessionForm() {
      this.set('creatingNewSession', false);
    },

    chooseSession(session) {
      this.set('currentSession', session);
      this.transitionToRoute('sessions.session.agendas', session.id);
    }
  }
});
