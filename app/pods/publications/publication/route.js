import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class PublicationRoute extends Route {
  async model(params) {
    return this.store.findRecord('publication-flow', params.publication_id, {
      include: 'case,status,mode,regulation-type,contact-persons,numac-numbers,identification',
      reload: true,
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
