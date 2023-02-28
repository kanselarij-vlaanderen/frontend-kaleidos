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

  CONTENT_TYPES = [
    {
      name: 'cases',
      searchType: 'decisionmaking-flows',
      searchFields: CasesSearchRoute.textSearchFields,
      highlightFields: CasesSearchRoute.highlightFields,
      dataMapping: CasesSearchRoute.postProcessData,
      createFilter: CasesSearchRoute.createFilter,
    },
    {
      name: 'agendaitems',
      searchType: 'agendaitems',
      searchFields: AgendaItemsSearchRoute.textSearchFields,
      highlightFields: AgendaItemsSearchRoute.highlightFields,
      dataMapping: AgendaItemsSearchRoute.postProcessData,
      createFilter: AgendaItemsSearchRoute.createFilter,
    },
    {
      name: 'pieces',
      searchType: 'pieces',
      searchFields: SearchDocumentsRoute.textSearchFields,
      highlightFields: SearchDocumentsRoute.highlightFields,
      dataMapping: SearchDocumentsRoute.postProcessData,
      createFilter: SearchDocumentsRoute.createFilter,
    },
    {
      name: 'decisions',
      searchType: 'agendaitems',
      searchFields: SearchDecisionsRoute.textSearchFields,
      highlightFields: SearchDecisionsRoute.highlightFields,
      dataMapping: SearchDecisionsRoute.postProcessData,
      createFilter: SearchDecisionsRoute.createFilter,
    },
    {
      name: 'news-items',
      searchType: 'news-items',
      searchFields: SearchNewsItemsRoute.textSearchFields,
      highlightFields: SearchNewsItemsRoute.highlightFields,
      dataMapping: SearchNewsItemsRoute.postProcessData,
      createFilter: SearchNewsItemsRoute.createFilter,
    },
  ];

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = { ...searchParams, ...filterParams };

    this.lastParams.stageLive(params);

    const results = await Promise.all(
      this.CONTENT_TYPES.map((type) => {
        const searchModifier = ':sqs:';
        const textSearchKey = type.searchFields.join(',');

        const filter = type.createFilter(searchModifier, textSearchKey, params);

        this.lastParams.commit();

        if (isEmpty(params.searchText)) {
          return [];
        }

        // session-dates can contain multiple values.
        // Depending on the sort order (desc, asc) we need to aggregrate the values using min/max
        let sort = params.sort;
        if (params.sort === 'session-dates') {
          sort = ':min:session-dates';
        } else if (params.sort === '-session-dates') {
          sort = '-:max:session-dates'; // correctly converted to mu-search syntax by the mu-search util
        }

        return (async () => {
          const results = await search(
            type.searchType,
            0,
            10,
            sort,
            filter,
            (searchData) => type.dataMapping(searchData, this.store),
            {
              fields: type.highlightFields,
            }
          );

          return {
            name: type.name,
            data: results,
          };
        })();
      })
    );

    let flatResults = [];
    for (const searchType of results) {
      flatResults = flatResults.concat(
        searchType.data.map((data) => {
          return { name: searchType.name, data: data};
        })
      );
    }

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
