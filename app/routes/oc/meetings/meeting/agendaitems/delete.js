import Route from '@ember/routing/route';

export default Route.extend({
  modelName: "oc-meeting",
  
  model() {
    return this.modelFor('oc.meetings.meeting');
  },
  
  afterModel(model) {
    model.deleteRecord();
  },

  renderTemplate(controller, model) {
    this.render('oc.meetings.meeting.agendaitems.delete', {
      controller: 'oc.meetings.meeting.agendaitems.delete',
      outlet: 'modal',
      into: 'oc.meetings.meeting.agendaitems',
      model: model
    });
  }

});
