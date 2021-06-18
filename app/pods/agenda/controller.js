import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { alias } from '@ember/object/computed';
import { action } from '@ember/object';

export default class AgendaController extends Controller {
  @service sessionService;
  @service agendaService;
  @service router;
  @service currentSession;

  @tracked isLoading = false;

  @alias('sessionService.currentAgendaitems') currentAgendaitems;

  get shouldHideNav() {
    return this.router.currentRouteName === 'agenda.compare';
  }

  get showPrintButton() {
    return this.router.currentRouteName === 'agenda.print';
  }

  @action
  selectAgenda(agenda) {
    this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, agenda.get('id'));
  }

  @action
  navigateToDecisions(currentSessionId, currentAgendaId) {
    this.transitionToRoute(
      'print-overviews.decisions.agendaitems',
      currentSessionId,
      currentAgendaId
    );
  }

  @action
  navigateToPressAgenda(currentSessionId, currentAgendaId) {
    this.transitionToRoute(
      'print-overviews.press-agenda.agendaitems',
      currentSessionId,
      currentAgendaId
    );
  }

  @action
  navigateToNewsletter(currentSessionId) {
    this.transitionToRoute(
      'newsletter',
      currentSessionId
    );
  }

  @action
  navigateToAgenda(selectedAgendaId) {
    this.transitionToRoute('agenda.agendaitems', this.model.meeting.id, selectedAgendaId);
  }

  @action
  loadingAgendaitems() {
    this.isLoading = !this.isLoading;
  }

  @action
  handleAgendaItemCreation() {
    this.send('reloadModel');
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
