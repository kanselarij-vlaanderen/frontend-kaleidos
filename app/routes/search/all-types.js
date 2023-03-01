import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import AgendaItemsSearchRoute from './agendaitems';
import CasesSearchRoute from './cases';
import SearchDocumentsRoute from './documents';
import SearchNewsItemsRoute from './news-items';
import SearchDecisionsRoute from './decisions';

export default class AllTypes extends Route {
  @service store;

  queryParams = {
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  CONTENT_TYPES = {
    cases: {
      searchType: 'decisionmaking-flows',
      searchFields: CasesSearchRoute.textSearchFields,
      highlightFields: CasesSearchRoute.highlightFields,
      dataMapping: CasesSearchRoute.postProcessData,
      createFilter: CasesSearchRoute.createFilter,
      retrieveDate: (case_) => case_.attributes.created,
    },
    agendaitems: {
      searchType: 'agendaitems',
      searchFields: AgendaItemsSearchRoute.textSearchFields,
      highlightFields: AgendaItemsSearchRoute.highlightFields,
      dataMapping: AgendaItemsSearchRoute.postProcessData,
      createFilter: AgendaItemsSearchRoute.createFilter,
      retrieveDate: (agendaitem) => agendaitem.sessionDates,
    },
    pieces: {
      searchType: 'pieces',
      searchFields: SearchDocumentsRoute.textSearchFields,
      highlightFields: SearchDocumentsRoute.highlightFields,
      dataMapping: SearchDocumentsRoute.postProcessData,
      createFilter: SearchDocumentsRoute.createFilter,
      retrieveDate: (piece) => piece.attributes.created,
    },
    decisions: {
      searchType: 'agendaitems',
      searchFields: SearchDecisionsRoute.textSearchFields,
      highlightFields: SearchDecisionsRoute.highlightFields,
      dataMapping: SearchDecisionsRoute.postProcessData,
      createFilter: SearchDecisionsRoute.createFilter,
      retrieveDate: (decision) => decision.sessionDates,
    },
    'news-items': {
      searchType: 'news-items',
      searchFields: SearchNewsItemsRoute.textSearchFields,
      highlightFields: SearchNewsItemsRoute.highlightFields,
      dataMapping: SearchNewsItemsRoute.postProcessData,
      createFilter: SearchNewsItemsRoute.createFilter,
      retrieveDate: (newsItem) => newsItem.latestAgendaitem.meetingDate,
    },
  };

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = { ...searchParams, ...filterParams };

    this.lastParams.stageLive(params);
    this.lastParams.commit();

    if (isEmpty(params.searchText)) {
      return [];
    }

    const results = await Promise.all(
      Object.entries(this.CONTENT_TYPES).map((entry) => {
        const [name, type] = entry;
        const filter = type.createFilter(params);

        return (async () => {
          const results = await search(
            type.searchType,
            0,
            10,
            null,
            filter,
            (searchData) => type.dataMapping(searchData, this.store),
            {
              fields: type.highlightFields,
            }
          );

          return {
            name,
            data: results,
          };
        })();
      })
    );

    let flatResults = [];
    for (const searchType of results) {
      flatResults = flatResults.concat(
        searchType.data.map((data) => {
          return { name: searchType.name, data: data };
        })
      );
    }

    const sortFunc = (r1, r2) => {
      const d1 = new Date(this.CONTENT_TYPES[r1.name].retrieveDate(r1.data));
      const d2 = new Date(this.CONTENT_TYPES[r2.name].retrieveDate(r2.data));
      return d1 < d2;
    };
    flatResults.sort(sortFunc);

    return flatResults;
  }

  setupController(controller) {
    super.setupController(...arguments);
    const searchText = this.paramsFor('search').searchText;

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }

    controller.searchText = searchText;
  }

  @action
  loading(transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor(this.routeName);
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
    return true;
  }
}
