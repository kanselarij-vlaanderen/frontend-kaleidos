import Route from '@ember/routing/route';

export default class PublicationsPublicationDocumentsRoute extends Route {
  async model() {
    const parentParams = this.paramsFor('publications.publication');
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': parentParams.publication_id,
      // TODO: paginatie uitklaren in design
      'page[size]': 200,
    });
    return pieces;
  }
}
