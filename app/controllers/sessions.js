import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  creatingNewSession: false,
  sessions: alias('model'),

  searchTask: task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('session', {
      filter: {
        plannedstart: searchValue
      }
    });
  }),

  actions: {
    async chooseSession(session) {
      this.set('selectedDate', session);
      this.set("currentSession", await this.store.findRecord('session',session.id, {
        include:"agendas"
      }));

    },

    resetValue(param) {
      if (param == "") {
        this.set('sessions', this.store.findAll('session'))
      }
    },

    createNewSession() {
      this.set('creatingNewSession', true);
    },

    cancelNewSessionForm() {
      this.set('creatingNewSession', false);
    },

     addAgendaToSelectedSession() {
      let newAgenda = this.store.createRecord('agenda', {
        name:"testAgendaName",
        session:this.get('currentSession')
      });
      
      newAgenda.save()
    }
  },
});
