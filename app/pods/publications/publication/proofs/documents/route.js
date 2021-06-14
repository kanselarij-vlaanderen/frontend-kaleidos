import Route from '@ember/routing/route';


export default class PublicationsPublicationProofsDocumentsRoute extends Route {
  model() {
    /** @type {import('app/models/_model-types').PublicationSubcase} */
    const pubSubcase = this.modelFor('publications.publication.proofing');
    // todo: add brondocumenten
    const publicationActivity = this.store.findRecord('publication-activity', pubSubcase.id, {
      include: 'proofing-activities,proofing-activities.used-pieces,proofing-activities.generated-pieces',
    });
    return publicationActivity;
  }
}
