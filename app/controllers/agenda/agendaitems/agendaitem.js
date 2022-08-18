import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AgendaAgendaitemsAgendaitemController extends Controller {
  @service currentSession;

  @tracked meeting;
  @tracked decisionsExist;
  @tracked newsItemExists;
  @tracked pressAgendaitemExists;

  get canShowDecisionTab() {
    return this.currentSession.isEditor || (this.meeting.isFinal && this.decisionsExist);
  }

  get canShowNewsletterTab() {
    return this.currentSession.may('manage-newsletter-infos') || (this.meeting.isFinal && this.newsItemExists);
  }

  get canShowPressAgendaTab() {
    return this.currentSession.isEditor || (this.meeting.isFinal && this.pressAgendaitemExists);
  }
}
