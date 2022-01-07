import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('publication-flow', params.publication_id, {
      include: [
        'case',
        'status',
        'mode',
        'identification.structured-identifier',
        'urgency-level',
        'regulation-type',
        'publication-status-change',
        'numac-numbers',
        'publication-subcase',
        'translation-subcase',
        'contact-persons',
        'contact-persons.person',
        'contact-persons.person.organization',
        'mandatees',
        'mandatees.person'
      ].join(','),
    });
  }

  async afterModel(model) {
    const publicationSubcase = await model.publicationSubcase;
    this.decision = await this.store.queryOne('decision', {
      'filter[publication-activity][subcase][:id:]': publicationSubcase.id,
      sort: 'publication-activity.start-date,publication-date',
    });
    this.publicationStatus = await model.status;
    this.publicationStatusChange = await model.publicationStatusChange;

  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.decision = this.decision;
    controller.publicationStatus = this.publicationStatus;
    controller.publicationStatusChange = this.publicationStatusChange;
  }
}
