import Route from '@ember/routing/route';

export default Route.extend({
  beforeModel() {
    this._super(...arguments);
  },
  // model() {
  //   return this.store.findAll('case-type');
  // },
});

