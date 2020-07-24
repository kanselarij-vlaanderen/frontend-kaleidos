import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(DataTableRouteMixin, AuthenticatedRouteMixin, {
  authenticationRoute: 'login',
  modelName: 'meeting',

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },
});
