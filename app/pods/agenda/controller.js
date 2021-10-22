import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AgendaController extends Controller {
  @service agendaService;
  @service router;
  @service currentSession;

  @tracked isLoading = false;

  get shouldHideNav() {
    return this.router.currentRouteName === 'agenda.compare';
  }

  @action
  toggleIsLoading() {
    this.isLoading = !this.isLoading;
  }

  @action
  refresh() {
    this.send('reloadModel');
  }
}
