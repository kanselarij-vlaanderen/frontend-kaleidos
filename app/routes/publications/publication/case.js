import Route from '@ember/routing/route';

export default class CaseRoute extends Route {
  model() {
    return this.modelFor('publications.publication');
  }
}
