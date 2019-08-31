import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import moment from 'moment';

export default Route.extend(DataTableRouteMixin, AuthenticatedRouteMixin, {
	authenticationRoute: 'login',
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
    let options = {};
    if (params.from) {
      options['filter[:gte:planned-start]'] = moment(params.from, 'YYYY-MM-DD').utc().format();
    }
    if (params.to) {
      options['filter[:lte:planned-start]'] = moment(params.to, 'YYYY-MM-DD').utc().format();
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
