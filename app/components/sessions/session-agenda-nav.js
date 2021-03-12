import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SessionsSessionAgendaNavComponent extends Component {
  /**
   * @argument currentAgenda
   */
  @service('-routing') routing;
  @service sessionService;
  @service currentSession;

  get firstAgendaitemOfAgenda() {
    return this.args.currentAgenda.firstAgendaitem;
  }

  get isInAgendaItemDetailRoute() {
    return this.routing.currentRouteName.startsWith('agenda.agendaitems.agendaitem');
  }
}
