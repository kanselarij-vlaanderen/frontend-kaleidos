import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class PublicationsPublicationDocumentsRoute extends Route {
  @service currentPublicationFlow;
  @service store;

  async model() {
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': this.currentPublicationFlow.publicationFlow.id,
      // TODO: paginatie uitklaren in design
      'page[size]': PAGE_SIZE.PUBLICATION_FLOW_PIECES,
      include: 'document-container',
    });
    return pieces.toArray();
  }
}
