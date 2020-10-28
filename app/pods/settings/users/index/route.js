import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, DataTableRouteMixin, {
  modelName: 'user',

  // standard table-related queryParams are handled by the DataTableRouteMixin

  mergeQueryOptions(params) {
    const {
      filter,
    } = params;

    const options = {
      include: 'group,organization,account',
    };

    if (filter) {
      options.filter = filter;
    }

    return options;
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },
});
