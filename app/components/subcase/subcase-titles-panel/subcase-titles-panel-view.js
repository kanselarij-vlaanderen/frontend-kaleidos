import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument meeting
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class SubcaseTitlesPanelView extends Component {
  @service subcaseIsApproved;
  @service currentSession;

  @tracked approved; // or acknowledged

  constructor() {
    super(...arguments);
    this.loadApproved.perform();
  }

  get canShowDecisionStatus() {
    return (
      this.args.meeting?.isFinal &&
      (this.currentSession.may('view-decisions-before-release') ||
        this.args.meeting?.internalDecisionPublicationActivity?.get('startDate'))
    );
  }

  @task
  *loadApproved() {
    if (this.canShowDecisionStatus) {
      this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
    } else {
      this.approved = false;
    }
  }

  get pillSkin(){
    if (this.approved) {
      return 'success';
    }
    return 'default';
  }
}
