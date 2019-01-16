import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  creatingNewSession: false,
  selectedAgenda: null,

  currentSession: computed('model', function () {
    let dateTimeOfToday = new Date();
    dateTimeOfToday.setHours(0, 0, 0, 0);
    let sessionOfThisWeek = this.get('model')
      .find(session => new Date(session.plannedstart) >= dateTimeOfToday);
    return sessionOfThisWeek;
  }),

  actions: {
    cancelNewSessionForm() {
      this.set('creatingNewSession', false);
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

    selectAgenda(agenda) {
      this.set('selectedAgenda', agenda);
    }
  },
});
