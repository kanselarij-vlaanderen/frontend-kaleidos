import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.store
      .query('oc-case', {
        filter: {
          ':exact:identifier': params.case_id,
        },
      })
      .then((cases) => {
        return Promise.resolve(cases.firstObject);
      });
  },

  afterModel(model) {
    if (!model) return;
    this.transitionTo('oc.cases.case.agendaitems', model.identifier);
  },
});
