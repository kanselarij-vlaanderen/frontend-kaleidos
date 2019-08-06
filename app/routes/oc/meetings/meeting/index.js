import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  modelName: "oc-meeting",
  afterModel(model) {
    this._super(...arguments);
    if (model) {
      this.transitionTo('oc.meetings.meeting.agendaitems', model);
    }
  }
});
