import Route from '@ember/routing/route';
// eslint-disable-next-line ember/no-mixins
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class OverviewCaseRoute extends Route.extend(DataTableRouteMixin) {
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
    showArchived: {
      refreshModel: true,
      as: 'toon_gearchiveerd',
    },
  };

  modelName = 'decisionmaking-flow';

  mergeQueryOptions(params) {
    const opts = {
      include: 'case'
    };
    if (!params.showArchived) {
      opts['filter[case][is-archived]'] = false;
    }
    return opts;
  }
}
