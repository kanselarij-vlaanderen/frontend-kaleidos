import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendaItemAgendaItemsAgendaRoute extends Route {
  @service sessionService;

  model(params) {
    return this.store.findRecord('agendaitem', params.agendaitem_id, {
      include: 'subcase'
    });
  }

  afterModel(model) {
    this.set('sessionService.selectedAgendaItem', model); // TODO: get rid of this global state
  }

  @action
  refreshRoute() {
    super.refreshRoute(...arguments);
    this.refresh();
  }
}
