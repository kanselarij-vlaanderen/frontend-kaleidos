import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class CasesCasePublicationFlowIndexRoute extends Route {
  @service store;

  async model(params) {
    const publicationFlow = await this.store.queryOne('publication-flow', {
      'filter[:id:]': params.publication_id,
      include: [
        'numac-numbers',
        'case',
        'case.decisionmaking-flow',
        'regulation-type',
        'decision-activity',
        'contact-persons',
        'contact-persons.person',
        'contact-persons.person.organization',
        'mandatees',
        'mandatees.person',
      ].join(',')
    });
    const subcase = await this.store.queryOne('subcase', {
      'filter[decision-activities][publication-flows][:id:]': publicationFlow.id,
      include: [
        'requested-by',
        'requested-by.person'
      ].join(',')
    });
    const meeting = await this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][agenda-activity][subcase][:id:]': subcase.id,
      include: 'kind'
    });
    const referenceDocuments = await this.store.queryAll('piece', {
      'filter[publication-flow][:id:]': publicationFlow.id,
      include: [
        'file',
        'document-container',
        'document-container.type',
        'access-level'
      ].join(','),
      sort: 'name',
    });
    return RSVP.hash({
      publicationFlow,
      subcase,
      meeting,
      referenceDocuments
    })
  }
}