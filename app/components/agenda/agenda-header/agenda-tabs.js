import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task, lastValue } from 'ember-concurrency';
import ENV from 'frontend-kaleidos/config/environment';

export default class AgendaAgendaHeaderAgendaTabsComponent extends Component {
  /**
   * @argument currentAgenda
   * @argument currentMeeting
   */
  @service router;
  @service store;

  @lastValue('loadFirstAgendaitem') firstAgendaitem;

  constructor() {
    super(...arguments);
    this.loadFirstAgendaitem.perform();
  }

  @task
  *loadFirstAgendaitem() {
    if (this.args.currentAgenda) {
      // sorting on type prevents defaulting to an announcement when there are notas
      return yield this.store.queryOne('agendaitem', {
        'filter[agenda][:id:]': this.args.currentAgenda.id,
        sort: 'type.position,number',
      });
    }
    return null;
  }

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
  
  get enableDigitalMinutes() {
    return ENV.APP.ENABLE_DIGITAL_MINUTES;
  }
}
