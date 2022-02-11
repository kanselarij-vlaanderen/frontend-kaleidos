import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { createTimeline } from './controller';

export default class PublicationsPublicationDecisionsIndexRoute extends Route {
  @service store;
  @service publicationService;

  async model() {
    const publicationSubcase = this.modelFor(
      'publications.publication.publication-activities'
    );
    let publicationActivities = await publicationSubcase.publicationActivities;
    publicationActivities = publicationActivities.toArray();
    const timeline = await createTimeline(publicationActivities);
    return timeline;
  }

  async afterModel() {
    this.publicationFlow = this.modelFor('publications.publication');
    this.isViaCouncilOfMinisters =
      await this.publicationService.getIsViaCouncilOfMinisters(
        this.publicationFlow
      );
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
