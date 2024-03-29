import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class RatificationAgendaitemAgendaitemsAgendaRoute extends Route {
  @service store;
  @service router;

  model() {
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    return this.store.findRecord('agendaitem', agendaItem.id, {
      include: [
        'agenda-activity',
        'agenda-activity.subcase',
        'agenda-activity.subcase.type',
        'agenda-activity.subcase.mandatees',
      ].join(','),
    });
  }

  async afterModel(model) {
    this.treatment = await model.treatment;
    this.decisionActivity = await this.treatment?.decisionActivity;
    this.agendaActivity = await model.agendaActivity;
    this.subcase = await this.agendaActivity?.subcase;
    // Check if the subcase is a ratification, otherwise redirect gracefully.
    // This happens when the agendaitem is changed while on this tab
    await this.subcase?.type;
    if (!this.subcase.isBekrachtiging) {
      this.router.transitionTo('agenda.agendaitems.agendaitem.index');
    }
    await model.hasMany('mandatees').reload();
    this.mandatees = (await model.mandatees)
      .slice()
      .sort((m1, m2) => m1.priority - m2.priority);

  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.subcase = this.subcase;
    controller.mandatees = this.mandatees;
    controller.decisionActivity = this.decisionActivity;
  }
}
