import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class AgendaAgendaHeaderAgendaTabsComponent extends Component {
  /**
   * @argument currentAgenda
   * @argument currentMeeting
   */
  @service router;
  @service store;
  @service currentSession;

  get firstAgendaitem() {
    return this.args.currentAgendaitems?.toArray().sortBy('show-as-remark').sortBy('number').firstObject;
  }

  get modelsForDetailRoute() {
    return [this.args.currentMeeting.id, this.args.currentAgenda.id, this.currentAgendaItemId || this.firstAgendaitem.id];
  }

  get isInAgendaItemDetailRoute() {
    return this.router.currentRouteName.startsWith('agenda.agendaitems.agendaitem');
  }

  get currentAgendaItemId() {
    const currentRoute = this.router.currentRoute;
    let agendaItemsRoute = currentRoute;
    if (currentRoute?.name?.startsWith('agenda.agendaitems.agendaitem')) {
      while (agendaItemsRoute.name !== 'agenda.agendaitems.agendaitem') {
        agendaItemsRoute = agendaItemsRoute.parent;
      }
      return agendaItemsRoute.params.agendaitem_id;
    } else if (currentRoute?.name?.startsWith('agenda.agendaitems')) {
      while (agendaItemsRoute.name !== 'agenda.agendaitems') {
        agendaItemsRoute = agendaItemsRoute.parent;
      }
      return agendaItemsRoute.queryParams.anchor;
    }
    return null;
  }
}
