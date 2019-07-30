import Route from '@ember/routing/route';
import $ from "jquery";
import DataTableRouteMixin from 'ember-data-table/mixins/route';

export default Route.extend(DataTableRouteMixin, {
  modelName: 'oc-agendaitem',
  queryParams: {
    term: {
      refreshModel: true
    }
  },
    
  model(params) {
    let term = params.term;
    let size = 10;
    // let searchResults = $.ajax({
    //   method: "GET",
    //   url: `/oc-agendaitems/search?filter[subject,notification,documents]=${term}&page[size]=${size}&page[number]=${params.page}`
    // });
    let searchResults = Promise.resolve([{id: '80017d64-afbb-11e9-804d-0242ac1a0004'}]);
    return searchResults.then(results => {
      let resultIds = results.map(res => res.id).join();
      return this.store.query('oc-agendaitem', { // Transition to random case
        page: {
          'size': size,
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
