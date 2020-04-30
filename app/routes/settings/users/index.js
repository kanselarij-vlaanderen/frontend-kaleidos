import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, DataTableRouteMixin, {
  modelName: 'user',
  router: service(),

  queryParams: {
    filter: {
      refreshModel: true
    }
  },

  mergeQueryOptions(params) {
    const filter = params.filter;
    const options = {
      include: 'group,organization',
    };

    if(filter) {
      options.filter = filter;
    }
    return options;
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
