import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const {
      // eslint-disable-next-line camelcase
      agenda_id,
    } = params;
    // eslint-disable-next-line camelcase
    if (agenda_id) {
      const agenda = this.store.findRecord('agenda', agenda_id);
      this.agenda = agenda;
      return agenda;
    }
  },

  async afterModel() {
    await this.agenda.get('createdFor');
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('meeting', this.agenda.get('createdFor'));
  },
});
