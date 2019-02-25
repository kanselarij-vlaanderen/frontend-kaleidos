import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const caze = this.modelFor('cases.case')
    return this.store.query('subcase', {
      filter: {case: {id: caze.id}},
      sort: "created"
    });
  }
});
