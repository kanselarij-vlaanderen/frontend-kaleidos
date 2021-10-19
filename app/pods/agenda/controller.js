import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AgendaController extends Controller {
  @service sessionService;
  @service agendaService;
  @service router;
  @service currentSession;

  @tracked isLoading = false;

  get currentAgendaitems() {
    return this.sessionService.currentAgendaitems;
  }

  get shouldHideNav() {
    return this.router.currentRouteName === 'agenda.compare';
  }

  get showPrintButton() {
    return this.router.currentRouteName === 'agenda.print';
  }

  @action
  loadingAgendaitems() {
    this.isLoading = !this.isLoading;
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
