import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  selectedAgenda: null,
  currentCase: null,
  addingSubCasesToAgenda: false,
  creatingNewSession: false,

  currentSession: computed('model', function() {
    let session = this.model.get('firstObject');
    return session;
  }),

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
