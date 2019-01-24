import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  selectedAgenda: null,
  currentCase: null,
  addingSubCasesToAgenda: false,
  creatingNewSession: false,

  currentSession: computed('model', function () {
    let session = this.model.get('firstObject');
    return session;
  }),

  actions: {
    cancelNewSessionForm() {
      this.set('creatingNewSession', false);
      this.fetchNewModel();
    },

     navigateBack(sessionId) {
      this.fetchNewModel();
      this.transitionToRoute('sessions.session', sessionId);
    },

    chooseSession(session) {
      this.set('currentSession', session);
      this.transitionToRoute('sessions.session', session.id);
    }
  },

     fetchNewModel() {
    let sessions = this.store.query('session', {
			filter: {
        ':gt:plannedstart': ""
			},
			sort: "number"
    });

    this.set('model', sessions);
    this.set('currentSession', sessions.get('firstObject'));
  }
});
