import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class PublicationsPublicationDecisionsIndexRoute extends Route {
  @service store;
  @service publicationService;

  async model() {
    const parentParams = this.paramsFor('publications.publication');
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': parentParams.publication_id,
      'page[size]': PAGE_SIZE.PUBLICATION_FLOW_PIECES,
      include: [
        'file',
        'document-container',
        'document-container.type',
        'access-level'
      ].join(',')
    });
    return pieces.slice().sort((a, b) => (a.receivedDate < b.receivedDate ? -1 : a.receivedDate === b.receivedDate ? 0 : 1));
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication.decisions');
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(
        this.publicationFlow
      );
  }

  setupController(ctrl) {
    super.setupController(...arguments);
    ctrl.publicationFlow = this.publicationFlow;
    ctrl.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }
}
