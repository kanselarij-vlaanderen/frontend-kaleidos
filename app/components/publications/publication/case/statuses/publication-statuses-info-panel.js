import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
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

  @task
  *loadData() {
    const publicationSubcase = yield this.args.publicationFlow.publicationSubcase;
    this.publicationActivities = yield publicationSubcase?.publicationActivities;
    this.proofingActivities = yield publicationSubcase?.proofingActivities;
    const translationSubcase = yield this.args.publicationFlow.translationSubcase;
    this.translationActivities = yield translationSubcase?.translationActivities;
  }
}
