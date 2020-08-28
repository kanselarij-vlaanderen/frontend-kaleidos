import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const {
      // eslint-disable-next-line camelcase
      agenda_id,
    } = params;
    // eslint-disable-next-line camelcase
    if (agenda_id) {
      return this.store.findRecord('agenda', agenda_id);
    }
  },
});
