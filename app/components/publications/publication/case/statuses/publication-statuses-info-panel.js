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
    this.publicationActivity = yield publicationSubcase.publicationActivity;
    this.proofingActivity = yield publicationSubcase.publicationActivity;
    this.translationActivity = yield publicationSubcase.publicationActivity;
  }
}
