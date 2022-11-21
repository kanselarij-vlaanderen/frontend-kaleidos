import Route from '@ember/routing/route';

export default class IndexPublicationRoute extends Route {
  beforeModel() {
    this.transitionTo('publications.publication.case');
  }
}
