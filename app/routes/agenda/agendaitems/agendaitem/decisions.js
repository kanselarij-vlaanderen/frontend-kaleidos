import Route from '@ember/routing/route';

export default class DecisionsAgendaitemAgendaitemsAgendaRoute extends Route {
  async model() {
    const decisions = await this.modelFor('agenda.agendaitems.agendaitem').get('subcase.decisions');
    return decisions;
  }

  async setupController(controller, model) {
    super.setupController(...arguments);
    const agendaItem = this.modelFor('agenda.agendaitems.agendaitem');
    const subcase = await agendaItem.get('subcase');
    controller.set('agendaItem', agendaItem);
    controller.set('subcase', subcase);
    controller.set('model', model);
  }
}
