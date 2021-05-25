import Route from '@ember/routing/route';
import moment from 'moment';

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

  actions: {
    refreshRoute() {
      this.refresh();
    },
  },
});
