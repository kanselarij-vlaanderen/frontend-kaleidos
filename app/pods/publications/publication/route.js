import Route from '@ember/routing/route';


export default class PublicationRoute extends Route {
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
}
