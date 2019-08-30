import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, DataTableRouteMixin, {
  modelName: 'oc-agendaitem',
  muSearch: service(),
  isLoading: false,

  queryParams: {
    term: {
      refreshModel: true
    },
    // size (implicit through mixin)
    // page (implicit through mixin)
  },
  
  model(params) {
    let that = this;
    if (!params.term) {
      return null;
    }
    const mapping = {
      'meeting.started-at': 'sessionDate'
    };
    params.filter = {
      '_all': params.term
    }
    params.page = {
      size: params.size,
      number: params.page
    };
    params.include = 'meeting';

    this.set('isLoading', true);
    return this.muSearch.query('oc-agendaitems',
                               params,
                               this.get('modelName'),
                               mapping)
      .then((results) => {
        that.set('isLoading', false);
        return results;
      }).catch(() => {
        that.set('isLoading', false);
        // message
        return [];
      });
  },
});
