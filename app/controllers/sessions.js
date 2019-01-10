import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  selectedDate: computed('selectedDate', function () {
    const sessions = this.get('model');
    if (!sessions) {
      return null;
    }
    return sessions.find(x => x.id === this.get('session.number'));
  }),

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
    chooseSession(session) {
      this.set('selectedDate', session);
    },

    resetValue(param) {
      if (param == "") {
        this.set('sessions', this.store.findAll('session'))
      }
    },
  },

});
