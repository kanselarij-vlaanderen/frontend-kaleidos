import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';


export default class PublicationsPublicationDecisionsRoute extends Route {
  @service store;
  @service publicationService;
  @service currentPublicationFlow;

  async model() {
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': this.currentPublicationFlow.publicationFlow.id,
      // TODO: paginatie uitklaren in design
      'page[size]': PAGE_SIZE.PUBLICATION_FLOW_PIECES,
      include: 'document-container',
    });
    return pieces.toArray();
  }

  async afterModel() {
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(this.currentPublicationFlow.publicationFlow);
  }

  setupController(ctrl) {
    ctrl.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
