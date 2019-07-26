import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
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
