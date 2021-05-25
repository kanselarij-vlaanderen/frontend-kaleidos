import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default class PublicationsPublicationDocumentsRoute extends Route {
  @inject store;

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
