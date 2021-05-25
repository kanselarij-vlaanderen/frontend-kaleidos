import Route from '@ember/routing/route';
import moment from 'moment';
import { inject } from '@ember/service';
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
  agendaService: inject(),
  modelName: 'meeting',

  queryParams: {
    from: {
      refreshModel: true,
    },
    to: {
      refreshModel: true,
    },
  },

  mergeQueryOptions(params) {
    const options = {};
    if (params.from) {
      options['filter[:gte:planned-start]'] = moment(params.from, 'YYYY-MM-DD').utc()
        .format();
    }
    if (params.to) {
      options['filter[:lte:planned-start]'] = moment(params.to, 'YYYY-MM-DD').utc()
        .format();
    }
    return options;
  },

  actions: {
    refreshRoute() {
      this._super(...arguments);
      this.refresh();
    },
  },

});
