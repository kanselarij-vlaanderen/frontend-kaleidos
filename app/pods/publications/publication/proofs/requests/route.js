import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsRequestsRoute extends Route {
  model() {
    const publicationSubcase = this.modelFor('publications.publication.proofs');
    this.store.query('request-activity', {
      'filter[publication-subcase][:id:]': publicationSubcase.id,
      include: 'email',
    });
  }
}
