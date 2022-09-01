import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PublicationRoute extends Route {
  @service store;
  @service publicationService;

  model(params) {
    return this.store.queryOne('publication-flow', {
      'filter[:id:]': params.publication_id,
      include: [
        'case.decisionmaking-flow.subcases',
        'decision-activity',
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
        'mandatees.person',
      ].join(','),
    });
  }

  async afterModel(model) {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(model);
  }

  setupController(ctrl) {
    super.setupController(...arguments);
    ctrl.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
