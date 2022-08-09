import Route from '@ember/routing/route';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-mixins
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default class SettingsOrganisationsRoute extends Route.extend(DataTableRouteMixin) {
  modelName = 'user';

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
  }

  @action
  refreshRoute() {
    this.refresh();
  }
}
