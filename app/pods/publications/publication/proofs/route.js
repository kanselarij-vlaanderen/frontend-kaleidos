import Route from '@ember/routing/route';


export default class PublicationProofsRoute extends Route {
  model() {
    const pubFlow = this.modelFor('publications.publication');
    const pubSubcase = pubFlow.publicationSubcase;
    return pubSubcase;
  }

  redirect() {
    this.transitionTo('publications.publication.proofs.documents');
  }
}
