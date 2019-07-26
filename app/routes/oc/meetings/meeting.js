import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  modelName: "oc-meeting",
  model(params) {
    return this.store.findRecord('oc-meeting', params.meeting_id);
  },
  renderTemplate(controller, model) {
    this.render('oc.meetings.meeting', {
      controller: 'oc.meetings.meeting',
      into: 'oc',
      model: model
    });
  }
});
