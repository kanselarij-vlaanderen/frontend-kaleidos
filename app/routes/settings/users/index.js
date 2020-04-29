import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
  modelName: 'user',
  router: service(),

  queryParams: {
    firstname: {
      refreshModel: true,
    },
  },

  model() {
    return this.store.query('user', {
      include: 'group,organization',
      sort: 'first-name'
    }).then(users => users.toArray());
  },

  mergeQueryOptions(params) {
    return {
      'filter[first-name]': params.firstname
    };
  },

  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
