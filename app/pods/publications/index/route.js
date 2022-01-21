import Route from '@ember/routing/route';

export default class PublicationsIndexRoute extends Route {
  beforeModel() {
    this.transitionTo('publications.overview');
  }
}
