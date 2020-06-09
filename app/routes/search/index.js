import Route from '@ember/routing/route';

export default class IndexSearchRoute extends Route {
  beforeModel () {
    this.transitionTo("search.cases");
  }
}
