import Route from '@ember/routing/route';


export default class PublicationRoute extends Route {
  async model(params) {
    return this.store.findRecord('publication-flow', params.publication_id, {
      include: 'case,status,mode,regulation-type,contact-persons,numac-numbers,identification',
      reload: true,
    });
  }
}
