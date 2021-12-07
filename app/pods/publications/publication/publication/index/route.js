import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsIndexRoute extends Route {
  beforeModel() {
    this.transitionTo('publications.publication.proofs.documents');
  }
}
