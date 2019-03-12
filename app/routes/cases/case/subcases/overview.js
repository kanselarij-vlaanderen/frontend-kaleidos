import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const caze = this.modelFor('cases.case');
    return this.store.query('subcase', {
      include: ['case','phase','type'], 
      filter: {case: {id: caze.id}},
      sort: "created"
    });
  }
});
