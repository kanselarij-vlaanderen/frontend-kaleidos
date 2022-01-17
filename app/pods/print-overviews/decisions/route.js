import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  store: service(),

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
