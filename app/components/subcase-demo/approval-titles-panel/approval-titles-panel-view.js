import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
import { action } from '@ember/object';

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

  @tracked vpModal = false;
  @tracked vpSent = false;

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
  }

  get canShowDecisionStatus() {
    return (
      this.isFinalMeeting &&
      (this.currentSession.may('view-decisions-before-release') ||
        this.args.meeting?.internalDecisionPublicationActivity?.get('startDate'))
    );
  }

  get isFinalMeeting() {
    return isPresent(this.args.meeting?.agenda.get('id'));
  }

  @task
  *loadAgendaData() {
    if (this.canShowDecisionStatus) {
      this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
    } else {
      this.approved = false;
    }
  }

  get pillSkin() {
    return this.approved ? 'success' : 'default';
  }

  @action
  showVpModal() {
    this.vpModal = !this.vpModal;
  }

  @action
  submitToVp() {
    this.vpModal = false;
    this.vpSent = true;
    this.toaster.success('Dossier is succesvol verstuurd naar het Vlaams Parlement');
  }

}
