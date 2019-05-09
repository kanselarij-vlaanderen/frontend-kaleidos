import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
  modelName: "case",

  mergeQueryOptions(params) {
    return {
      include: 'subcases',
      // filter: { 'is-archived': params.filter }
    };
  },

  actions: {
    refreshModel() {
      this.refresh();
    }
  }
});
