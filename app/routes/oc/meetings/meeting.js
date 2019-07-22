import Route from '@ember/routing/route';
import { next } from '@ember/runloop';

export default Route.extend({
  modelName: "oc-meeting",
  model(params) {
    return this.store.findRecord('oc-meeting', params.meeting_id);
  },
});
