import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AgendaController extends Controller {
  @service router;

  @tracked isLoading = false;
  @tracked isOpenSideNav = true;

  get shouldHideNav() {
    return this.router.currentRouteName === 'agenda.compare';
  }

  @action
  enableIsLoading() {
    this.isLoading = true;
  }

  @action
  disableIsLoading() {
    this.isLoading = false;
  }

  @action
  refresh() {
    this.send('reloadAgendaModel');
  }

  @action
  openSideNav() {
    this.isOpenSideNav = true;
  }

  @action
  collapseSideNav() {
    this.isOpenSideNav = false;
  }
}
