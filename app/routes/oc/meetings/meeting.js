import Route from '@ember/routing/route';
import { next } from '@ember/runloop';

export default Route.extend({
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
