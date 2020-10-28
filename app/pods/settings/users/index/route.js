import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, DataTableRouteMixin, {
  modelName: 'user',
  router: service(),

  queryParams: {
    filter: {
      refreshModel: true,
    },
    size: {
      refreshModel: true,
    },
  },

  mergeQueryOptions(params) {
    const {
      filter,
    } = params;
    const {
      size,
    } = params;

    const options = {
      include: 'group,organization,account',
    };

    if (filter) {
      options.filter = filter;
    }

    if (size) {
      options.size = size;
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
