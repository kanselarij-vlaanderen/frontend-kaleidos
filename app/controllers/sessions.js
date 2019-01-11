import Controller from '@ember/controller';
import { computed } from '@ember/object';
import moment from 'moment';

export default Controller.extend({
  creatingNewSession: false,
  selectedAgenda: null,

  currentSession: computed('model', function() {
    let foundSession = this.get('model').find(session => moment(session.plannedstart) > moment(new Date()));
    return foundSession;
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
