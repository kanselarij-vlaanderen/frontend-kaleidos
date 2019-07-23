import Route from '@ember/routing/route';

export default Route.extend({
  modelName: "oc-meeting",
  model() {
    return this.store.createRecord('oc-meeting', {});
  },
});