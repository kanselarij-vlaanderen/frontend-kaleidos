import Route from '@ember/routing/route';

export default class DetailAgendaitemAgendaitemsAgendaRoute extends Route {
  model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.findRecord('agendaitem', agendaItem.id, {
      // TODO: assess which data we want to load here, and which data we want to sideload in the
      // different panel-components (when those get refactored for data-loading). At least the mandatees
      // need to be reloaded here (from the backend), since the overview only loads a few mandatee-fields for efficfiency
      include: [
        'agenda-activity',
        'agenda-activity.subcase',
        'agenda-activity.subcase.type',
        'agenda-activity.subcase.mandatees'
      ].join(','),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const {
      agenda,
    } = this.modelFor('agenda');
    controller.set('agenda', agenda);
    controller.set('model', model);
  }
}
