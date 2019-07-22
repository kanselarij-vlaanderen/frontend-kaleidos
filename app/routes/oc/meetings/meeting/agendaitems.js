import Route from '@ember/routing/route';

export default Route.extend({
  modelName: "oc-agendaitem",
  model() {
    let parentModel = this.modelFor('oc.meetings.meeting');
    return parentModel.get('agendaItems');
  },
});
