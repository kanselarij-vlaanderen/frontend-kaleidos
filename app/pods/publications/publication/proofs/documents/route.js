import Route from '@ember/routing/route';


export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  async model() {
    // /** @type {import('app/models/_model-types').PublicationSubcase} */
    // const pubSubcase = this.modelFor('publications.publication.proofs');
    // // todo: add brondocumenten
    // const publicationActivity = this.store.findRecord('publication-activity', pubSubcase.id, {
    //   include: 'proofing-activities,proofing-activities.used-pieces,proofing-activities.generated-pieces',
    // });
    // return publicationActivity;
    const parentParams = this.paramsFor('publications.publication');
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': parentParams.publication_id,
      // TODO: paginatie uitklaren in design
      'page[size]': 200,
    });
    return pieces;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.initSort();
  }
}
