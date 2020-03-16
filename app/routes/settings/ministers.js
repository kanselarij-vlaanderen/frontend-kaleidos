import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import moment from 'moment';

export default Route.extend(AuthenticatedRouteMixin, {
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
      .then((mandatees) => {
        return mandatees.sortBy('priority');
      });
  },

  actions: {
    refreshRoute() {
      this.refresh();
    }
  }
});
