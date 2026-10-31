import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class AgendaAgendaHeaderAgendaTabsComponent extends Component {
  /**
   * @argument currentAgenda
   * @argument currentMeeting
   */
  @service router;
  @service store;

  @tracked firstAgendaitem = null;

  constructor() {
    super(...arguments);
    this.loadFirstAgendaitem.perform();
  }

  get responsiveBreakpoint() {
    return this.args.responsiveBreakpoint || 'small';
  }

  loadFirstAgendaitem = task(async () => {
    if (this.args.currentAgenda) {
      // sorting on type prevents defaulting to an announcement when there are notas
      this.firstAgendaitem = await this.store.queryOne('agendaitem', {
        'filter[agenda][:id:]': this.args.currentAgenda.id,
        sort: 'type.position,number',
      });
      return;
    }
    this.firstAgendaitem = null;
  });

  get modelsForDetailRoute() {
    return [this.args.currentMeeting.id, this.args.currentAgenda.id, this.currentAgendaItemId || this.firstAgendaitem?.id];
  }

  get isInAgendaItemDetailRoute() {
    return this.router.currentRouteName.startsWith('agenda.agendaitems.agendaitem');
  }

  get currentAgendaItemId() {
    const currentRoute = this.router.currentRoute;
    let agendaItemsRoute = currentRoute;
    if (currentRoute?.name.startsWith('agenda.agendaitems.agendaitem')) {
      while (agendaItemsRoute.name !== 'agenda.agendaitems.agendaitem') {
        agendaItemsRoute = agendaItemsRoute.parent;
      }
      return agendaItemsRoute.params.agendaitem_id;
    } else if (currentRoute?.name.startsWith('agenda.agendaitems')) {
      while (agendaItemsRoute.name !== 'agenda.agendaitems') {
        agendaItemsRoute = agendaItemsRoute.parent;
      }
      return agendaItemsRoute.queryParams.anchor;
    }
    return null;
  }
}
