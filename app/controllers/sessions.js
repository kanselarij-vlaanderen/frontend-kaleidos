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
      let date = new Date();
      date.setHours(0, 0, 0, 0);
      this.set('creatingNewSession', false);

      this.set('model', this.store.query('session', {
        filter: {
          ':gte:plannedstart': date.toISOString()
        }
      }))
    },

    chooseSession(session) {
      this.set('currentSession', session);
      this.transitionToRoute('sessions.session.agendas', session.id);
    }
  }
});
