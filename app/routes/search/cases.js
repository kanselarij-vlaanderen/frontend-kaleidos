import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { startOfDay, endOfDay, parse } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import filterStopWords from 'frontend-kaleidos/utils/filter-stopwords';

export default class CasesSearchRoute extends Route {
  @service store;
  @service plausible;

  queryParams = {
    archived: {
      refreshModel: true,
      as: 'gearchiveerd',
    },
    confidentialOnly: {
      refreshModel: true,
      as: 'enkel_vertrouwelijk',
    },
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
    sort: {
      refreshModel: true,
      as: 'sorteer',
    },
  };

  static textSearchFields = [
    'title^4',
    'shortTitle^4',
    'subcaseTitle^2',
    'subcaseSubTitle^2',
    'mandateRoles^2',
    'mandateeFirstNames^3',
    'mandateeFamilyNames^3',
    'newsItemTitle^2',
    'newsItem',
    'subcaseTitle^2',
    'subcaseSubTitle^2',
    'documentNames^2',
    'documentFileNames^2',
    'documents.content',
    'decisionNames^2',
    'decisionFileNames^2',
    'decisions.content',
  ];
  static highlightFields = [
    'title',
    'shortTitle',
    'subcaseTitle',
    'subcaseSubTitle',
  ];

  static postProcessData = (searchData) => {
    CasesSearchRoute.postProcessHighlight(searchData);
    CasesSearchRoute.postProcessDates(searchData);
    CasesSearchRoute.setSubcaseHighlights(searchData);

    searchData.highlight = {
      ...searchData.attributes,
      ...searchData.highlight,
    };

    return searchData;
  };

  static postProcessDates(_case) {
    const { sessionDates } = _case.attributes;
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const sorted = sessionDates.sort();
        _case.attributes.sessionDates = sorted[sorted.length - 1];
      } else {
        _case.attributes.sessionDates = sessionDates;
      }
    }
  }

  static postProcessHighlight(_case) {
    const { highlight } = _case;
    if (highlight) {
      if (highlight.title) {
        highlight.title = highlight.title[0];
      }
      if (highlight.shortTitle) {
        highlight.shortTitle = highlight.shortTitle[0];
      }
    }
  }

  static setSubcaseHighlights(_case) {
    if (_case.highlight) {
      if (_case.highlight.subcaseTitle) {
        _case.subcaseHighlights = _case.highlight.subcaseTitle;
      } else if (_case.highlight.subcaseSubTitle) {
        _case.subcaseHighlights = _case.highlight.subcaseSubTitle;
      }
    }
  }

  static createFilter(params) {
    const textSearchFields = [...CasesSearchRoute.textSearchFields];
    const searchModifier = ':sqs:';
    const textSearchKey = textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[searchModifier + textSearchKey] = filterStopWords(params.searchText);
    }

    if (!isEmpty(params.mandatees)) {
      filter[':terms:mandateeIds'] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      const to = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte,gte:sessionDates'] = [
        to.toISOString(),
        from.toISOString(),
      ].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      filter[':gte:sessionDates'] = date.toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte:sessionDates'] = date.toISOString();
    }

    if (params.archived === 'hide') {
      filter.isArchived = 'false';
    } else if (params.archived === 'only') {
      filter.isArchived = 'true';
    }

    if (params.confidentialOnly) {
      filter.subcaseConfidential = 'true';
    }

    return filter;
  }

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = { ...searchParams, ...filterParams };

    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'page')
      )
    ) {
      params.page = 0;
    }

    const filter = CasesSearchRoute.createFilter(params);

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

    const results = await search(
      'decisionmaking-flows',
      params.page,
      params.size,
      sort,
      filter,
      CasesSearchRoute.postProcessData,
      {
        fields: CasesSearchRoute.highlightFields,
      }
    );

    this.trackSearch(
      params.searchText,
      params.mandatees,
      results.length,
      params.dateFrom,
      params.dateTo,
      params.sort,
      params.archived,
      params.confidentialOnly
    );

    return results;
  }


  async trackSearch(searchTerm, mandatees, resultCount, from, to, sort, archived, confidentialOnly) {
    const ministerNames = (
      await Promise.all(
        mandatees.map((id) => this.store.findRecord('person', id)))
    ).map((person) => person.fullName);

    this.plausible.trackEventWithRole('Zoekopdracht', {
      'Zoekterm': searchTerm,
      'Ministers': ministerNames.join(', '),
      'Aantal resultaten': resultCount,
      'Vanaf': from,
      'Tot en met': to,
      'Sorteringsoptie': sort,
      'Verwijderde dossiers': archived,
      'Toon enkel dossiers met beperkte toegang': confidentialOnly,
    }, true);
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
