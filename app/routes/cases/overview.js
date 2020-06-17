import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { action } from '@ember/object';

export default class OverviewCaseRoute extends Route.extend(DataTableRouteMixin) {
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina'
    },
    size: {
      refreshModel: true,
      as: 'aantal'
    },
    sort: {
      refreshModel: true,
      as: 'sorteer'
    },
    showArchived: {
      refreshModel: true,
      as: 'toon_gearchiveerd'
    }
  };
  modelName = 'case';

  mergeQueryOptions (params) {
    if (!params.showArchived) {
      return { 'filter[is-archived]': false };
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
