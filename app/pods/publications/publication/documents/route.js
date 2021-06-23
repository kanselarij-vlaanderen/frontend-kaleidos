import Route from '@ember/routing/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsPublicationDocumentsRoute extends Route {
  async model() {
    const parentParams = this.paramsFor('publications.publication');
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': parentParams.publication_id,
      // TODO: paginatie uitklaren in design
      'page[size]': CONSTANTS.MAX_PAGE_SIZES.PUBLICATION_FLOW_PIECES,
    });
    return pieces;
  }
}
