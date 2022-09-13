import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

export default class AgendaAgendaitemsAgendaitemController extends Controller {
  @service currentSession;

  @tracked meeting;
  @tracked treatment;

  get hasDecision() {
    return isPresent(this.treatment?.decisionActivity.get('id'));
  }

  get hasNewsitem() {
    return isPresent(this.treatment?.newsletterInfo.get('id'));
  }

  get hasPressAgendaitem() {
    return this.model.titlePress && this.model.textPress;
  }

  get canShowDecisionTab() {
    return this.currentSession.may('manage-decisions')
      || (this.meeting.isFinal && this.hasDecision);
  }

  get canShowNewsletterTab() {
    return this.currentSession.may('manage-newsletter-infos')
      || (this.meeting.isFinal && this.hasNewsitem);
  }

  get canShowPressAgendaTab() {
    return this.currentSession.may('manage-agendaitems')
      || (this.meeting.isFinal && this.hasPressAgendaitem);
  }
}
