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
  @service sessionService;
  @service currentSession;

  @lastValue('loadFirstAgendaitemId') firstAgendaitemId;

  constructor() {
    super(...arguments);
    this.loadFirstAgendaitemId.perform();
  }

  @task
  *loadFirstAgendaitemId() {
    if (this.args.currentAgenda) {
      const firstAgendaitemId = yield this.store.queryOne('agendaitem', {
        'filter[agenda][:id:]': this.args.currentAgenda.id,
        sort: 'number',
      });
      return yield firstAgendaitemId;
    }
    return null;
  }

  get modelsForDetailRoute() {
    return [this.args.currentMeeting.id, this.args.currentAgenda.id, this.currentAgendaItemId || this.firstAgendaitemId];
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
