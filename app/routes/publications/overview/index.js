import Route from '@ember/routing/route';

export default class PublicationsOverviewIndexRoute extends Route {
  beforeModel() {
    this.transitionTo('publications.overview.all');
  }
}
