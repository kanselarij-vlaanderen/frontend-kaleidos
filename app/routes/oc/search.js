import Route from '@ember/routing/route';
import $ from "jquery";
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, DataTableRouteMixin, {
  modelName: 'oc-agendaitem',
  queryParams: {
    term: {
      refreshModel: true
    }
  },

  model(params) {
    if (!params.term) {
      return null;
    }
    let searchResults = $.ajax({
      method: "GET",
      url: `/oc-agendaitems/search?filter[subject,notification,documents]=${params.term}&page[size]=${params.size}&page[number]=${params.page}`
    });
    return searchResults.then(results => {
      if (results.count === 0) {
        return null;
      }
      let resultIds = results.data.map(res => res.id).join();
      return this.store.query('oc-agendaitem', { // Transition to random case
        page: {
          'size': params.size,
          'number': params.page
        },
        sort: params.sort,
        filter: {
          'id': resultIds
        },
        include: 'meeting'
      });
    });
  },
});
