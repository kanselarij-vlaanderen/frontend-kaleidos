import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const agenda_id = params.agenda_id;
    if (agenda_id) {
      const agenda = this.store.findRecord('agenda', agenda_id);
      return agenda;
    }
  }
});
