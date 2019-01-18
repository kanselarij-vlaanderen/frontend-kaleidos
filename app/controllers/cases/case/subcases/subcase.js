import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import { A } from '@ember/array';

export default Controller.extend({
  sessions: A([]),
  session: null,
  actions: {
    async resetValue(param) {
      if (param === "") {
        this.set('contacts', this.store.findAll('capacity'));
      }
    },
    async chooseSession(session) {
     const subcase = this.get('model');
     subcase.set('session', session);
     subcase.save();
    }
  },
  searchSession : task(function* (searchValue) {
    yield timeout(300);
    return this.store.query('session', {
      filter: {
        plannedstart: searchValue
      }
    });
  }),
  didInsertElement: async function () {
    this._super(...arguments);
    return await this.getRelatedSession();
  },
  getRelatedSession (){
    this.set('session', this.get('model').get('session'));
  }
});
