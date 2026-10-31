import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.mandatees,publication-flow.mandatees.person)
 */
export default class PublicationsPublicationCaseStatusesPublicationStatusesInfoPanelComponent extends Component {
  @service store

  @tracked publicationActivity;
  @tracked proofingActivity;
  @tracked translationActivity;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    const publicationSubcase = await this.args.publicationFlow.publicationSubcase;
    this.publicationActivities = await publicationSubcase?.publicationActivities;
    this.proofingActivities = await publicationSubcase?.proofingActivities;
    const translationSubcase = await this.args.publicationFlow.translationSubcase;
    this.translationActivities = await translationSubcase?.translationActivities;
  });
}
