import Route from '@ember/routing/route';

export default Route.extend({
  modelName: "oc-agendaitem",
  model() {
    let parentModel = this.modelFor('oc.meetings.meeting');
    let params = {
      filter: {
        meeting: {
          id: parentModel.id
        }
      },
      include: 'submitters'
    };
    return this.store.query('oc-agendaitem', params);
    // return parentModel.get('agendaItems');
  },
  
  setupController(controller, model) {
    controller.set('meeting', this.modelFor('oc.meetings.meeting'));
    controller.set('model', model);
  },

});
