import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class SessionsSessionAgendaNavComponent extends Component {
  /**
   * @argument currentAgenda
   * @argument compareAgendas: action handler
   * @argument clearSelectedAgendaitem: action handler
   * @argument navigateToDocuments: action handler
   */
  @service('-routing') routing;
  @service sessionService;
  @service currentSession;

  get firstAgendaitemOfAgenda() {
    return this.args.currentAgenda.firstAgendaitem;
  }

  get selectedAgendaitemClass() {
    if (this.routing.currentRouteName.includes('agenda.agendaitems.agendaitem.')) {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }

  get selectedOverviewClass() {
    if (this.routing.currentRouteName === 'agenda.agendaitems.index') {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }

  get selectedCompareClass() {
    if (this.routing.currentRouteName === 'agenda.compare') {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }

  get selectedDocumentClass() {
    if (this.routing.currentRouteName === 'agenda.documents') {
      return 'vlc-tabs-reverse__link--active';
    }
    return null;
  }

  @action
  compareAgendas() {
    this.args.compareAgendas();
  }

  @action
  goToOverview() {
    this.args.clearSelectedAgendaitem();
  }

  @action
  navigateToDocuments() {
    this.args.navigateToDocuments();
  }
}
