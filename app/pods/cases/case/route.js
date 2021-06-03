import Route from '@ember/routing/route';

export default class CasesCaseRoute extends Route {
  model(params) {
    return this.store.findRecord('case', params.id, {
      reload: true,
    });
  }
}
