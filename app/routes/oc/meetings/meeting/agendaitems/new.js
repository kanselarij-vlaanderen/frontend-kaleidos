import Route from '@ember/routing/route';

export default Route.extend({
  modelName: "oc-agendaitem",
  
  model() {
    return this.store.createRecord('oc-agendaitem', {});
  },
  
  renderTemplate(controller, model) {
    this.render('oc.meetings.meeting.agendaitems.new', {
      controller: 'oc.meetings.meeting.agendaitems.new',
      outlet: 'modal',
      into: 'oc.meetings.meeting.agendaitems',
      model: model
    });
  },

  setupController(controller, model) {
    const governmentBodies = this.store.query('government-body', { sort: '-name' });
    controller.set('governmentBodies', governmentBodies);
    const meeting = this.modelFor('oc.meetings.meeting');
    model.set('meeting', meeting);
    controller.set('model', model);
  }

});
