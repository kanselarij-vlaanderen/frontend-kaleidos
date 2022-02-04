import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

export default class PublicationsPublicationDecisionsRoute extends Route {
  @service store;
  @service publicationService;

  async model() {
    const parentParams = this.paramsFor('publications.publication');
    const pieces = await this.store.query('piece', {
      'filter[publication-flow][:id:]': parentParams.publication_id,
      // TODO: paginatie uitklaren in design
      'page[size]': PAGE_SIZE.PUBLICATION_FLOW_PIECES,
      include: 'document-container',
    });
    return pieces.toArray();
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(this.publicationFlow);
  }

  setupController(ctrl) {
    ctrl.publicationFlow = this.publicationFlow;
    ctrl.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
  }

  @action
  refresh() {
    super.refresh();
  }
}
