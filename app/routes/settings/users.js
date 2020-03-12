import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.store.query('user', { sort: 'first-name' }).then(users => users.toArray());
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
