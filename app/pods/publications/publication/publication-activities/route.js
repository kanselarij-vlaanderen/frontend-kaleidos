import Route from '@ember/routing/route';

export default class PublicationsPublicationPublicationActivitiesRoute extends Route {
  async model() {
    this.publicationFlow = this.modelFor('publications.publication');
    const publicationSubcase = await this.publicationFlow.publicationSubcase;
    return this.store.queryOne('publication-subcase', {
      'filter[:id:]': publicationSubcase.id,
      include: [
        'publication-activities',
        'publication-activities.used-pieces',
        'publication-activities.decisions',
      ].join(','),
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.publicationFlow = this.publicationFlow;
  }
}
