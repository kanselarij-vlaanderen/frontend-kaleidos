import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
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
