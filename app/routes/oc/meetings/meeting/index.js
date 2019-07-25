import Route from '@ember/routing/route';

export default Route.extend({
  modelName: "oc-meeting",
  afterModel(model) {
    this._super(...arguments);
    if (model) {
      this.transitionTo('oc.meetings.meeting.agendaitems', model);
    }
  }
});
