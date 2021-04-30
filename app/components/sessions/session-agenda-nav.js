import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class SessionsSessionAgendaNavComponent extends Component {
  /**
   * @argument currentAgenda
   */
  @service router;
  @service sessionService;
  @service currentSession;

  get firstAgendaitemOfAgenda() {
    return this.args.currentAgenda.firstAgendaitem;
  }

  get isInAgendaItemDetailRoute() {
    return this.router.currentRouteName.startsWith('agenda.agendaitems.agendaitem');
  }

  get currentAgendaItemId() {
    const currentRoute = this.router.currentRoute;
    let agendaItemsRoute = currentRoute;
    if (currentRoute && currentRoute.name.startsWith('agenda.agendaitems.agendaitem')) {
      while (agendaItemsRoute.name !== 'agenda.agendaitems.agendaitem') {
        agendaItemsRoute = agendaItemsRoute.parent;
      }
      return agendaItemsRoute.params.agendaitem_id;
    }
    return null;
  }
}
