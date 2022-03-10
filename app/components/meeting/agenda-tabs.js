import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';

export default class SessionsSessionAgendaNavComponent extends Component {
  /**
   * @argument currentAgenda
   * @argument currentMeeting
   */
  @service router;
  @service store;
  @service currentSession;

  @lastValue('loadFirstAgendaitem') firstAgendaitem;

  constructor() {
    super(...arguments);
    this.loadFirstAgendaitem.perform();
  }

  @task
  *loadFirstAgendaitem() {
    if (this.args.currentAgenda) {
      // sorting on show-as-remark prevents defaulting to an announcement when there are notas
      return yield this.store.queryOne('agendaitem', {
        'filter[agenda][:id:]': this.args.currentAgenda.id,
        sort: 'show-as-remark,number',
      });
    }
    return null;
  }

  get modelsForDetailRoute() {
    return [this.args.currentMeeting.id, this.args.currentAgenda.id, this.currentAgendaItemId || this.firstAgendaitem];
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
