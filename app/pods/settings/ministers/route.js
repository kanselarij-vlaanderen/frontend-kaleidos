import Route from '@ember/routing/route';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend({
  model() {
    return this.store
      .query('mandatee', {
        filter: {
          ':gte:end': moment()
            .utc()
            .toDate()
            .toISOString(),
        },
      })
      .then((mandatees) => mandatees.sortBy('priority'));
  },

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    refreshRoute() {
      this.refresh();
    },
  },
});
