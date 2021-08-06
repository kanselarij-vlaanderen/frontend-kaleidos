import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Route.extend(DataTableRouteMixin, {
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

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    refresh() {
      this._super(...arguments);
      this.refresh();
    },
  },
});
