import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default Route.extend({
  sessionService: inject(),

  model(params) {
    const agendaitem_id = params.agendaitem_id;
    let activeAGendaItemSection = localStorage.getItem('activeAgendaItemSection');
    if (!activeAGendaItemSection) {
      localStorage.setItem('activeAgendaItemSection', 'details');
    }
    return this.store.findRecord('agendaitem', agendaitem_id, {
      include: 'agenda-activity,agenda-activity.subcase'
    });

  },

  afterModel(model) {
    this.set('sessionService.selectedAgendaItem', model);
  },

  actions: {
    refreshRoute() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
