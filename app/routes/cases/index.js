import Route from '@ember/routing/route';
// eslint-disable-next-line ember/no-mixins
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class CasesIndexRoute extends Route.extend(DataTableRouteMixin) {
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  modelName = 'decisionmaking-flow';

  mergeQueryOptions() {
    const opts = {
      include: 'case',
    };
    return opts;
  }
}
