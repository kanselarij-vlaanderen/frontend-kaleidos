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
  @service plausible;
  @service intl;

  CONTENT_TYPES = {
    cases: {
      searchType: 'decisionmaking-flows',
      searchFields: CasesSearchRoute.textSearchFields,
      highlightFields: CasesSearchRoute.highlightFields,
      dataMapping: CasesSearchRoute.postProcessData,
      createFilter: CasesSearchRoute.createFilter,
      retrieveDate: (case_) => case_.attributes.sessionDates,
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
      retrieveDate: (piece) => piece.attributes.meetingDate,
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
      Object.entries(this.CONTENT_TYPES).map(async (entry) => {
        const [name, type] = entry;
        const filter = await type.createFilter(params, this.store);

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
      return d2 - d1;
    };

    flatResults.sort(sortFunc);

    const counts = [];
    for (const result of results) {
      counts[result.name] = result.data.meta.count;
      const count = result.data.meta.count;
      let name;
      let route;
      let tab; // for plausible
      switch (result.name) {
        case 'cases':
          name = this.intl.t('cases');
          route = 'search.cases';
          tab = 'Dossiers';
          break;
        case 'agendaitems':
          name = this.intl.t('agendas');
          route = 'search.agendaitems';
          tab = 'Agenda';
          break;
        case 'pieces':
          name = this.intl.t('documents');
          route = 'search.documents';
          tab = 'Documenten';
          break;
        case 'decisions':
          name = this.intl.t('decisions');
          route = 'search.decisions';
          tab = 'Beslissingen';
          break;
        case 'news-items':
          name = this.intl.t('news-items');
          route = 'search.news-items';
          tab = 'Kort bestek';
          break;
        default:
          break;
      }
      counts.push({ name, count, route, tab });
    }

    this.trackSearch(
      params.searchText,
      flatResults.length,
      params.mandatees,
      params.dateFrom,
      params.dateTo,
    );

    return { results: flatResults, counts };
  }

  setupController(controller) {
    super.setupController(...arguments);
    const searchText = this.paramsFor('search').searchText;

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }

    controller.searchText = searchText;
  }

  async trackSearch(searchTerm, resultCount, mandatees, from, to) {
    const ministerNames = (
      await Promise.all(
        mandatees.map((id) => this.store.findRecord('person', id)))
    ).map((person) => person.fullName);

    this.plausible.trackEventWithRole('Zoekopdracht', {
      'Zoekterm': searchTerm,
      'Aantal resultaten': resultCount,
      'Ministers': ministerNames.join(', '),
      'Van': from,
      'Tot en met': to,
    }, true);
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
