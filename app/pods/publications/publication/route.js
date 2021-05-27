import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class PublicationRoute extends Route {
  async model(params) {
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
        'contact-persons'
      ].join(','),
    });
  }

  async afterModel() {
    const publicationStatusPromise = this.store.query('publication-status', {});
    const regulationTypePromise = this.store.query('regulation-type', {});
    return RSVP.all([
      publicationStatusPromise,
      regulationTypePromise
    ]);
  }
}
