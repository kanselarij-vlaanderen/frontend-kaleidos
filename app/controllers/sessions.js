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
    },

    addAgendaToSelectedSession() {
      let newAgenda = this.store.createRecord('agenda', {
        name: "OntwerpAgenda",
        dateSent: new Date()
      });

      newAgenda.save().then(agenda => {
        agenda.set('session', this.get('currentSession'));
        return agenda.save();
      });
    },
  },
});
