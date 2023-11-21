import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import search from 'frontend-kaleidos/utils/mu-search';
import { parse, startOfDay, endOfDay } from 'date-fns';
import { inject as service } from '@ember/service';
import filterStopWords from 'frontend-kaleidos/utils/filter-stopwords';
import Snapshot from 'frontend-kaleidos/utils/snapshot';

export default class SearchDecisionsRoute extends Route {
  @service store;
  @service plausible;

  queryParams = {
    decisionResults: {
      refreshModel: true,
      as: 'resultaat_beslissing',
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
    'subcaseTitle^2',
    'subcaseShortTitle^2',
    'decisionName^2',
    'decisionFileName^2',
    'decision.content',
  ];
  static highlightFields = ['subcaseShortTitle,subcaseTitle'];

  static postProcessData = async (agendaitem, store) => {
    SearchDecisionsRoute.postProcessHighlights(agendaitem);
    const entry = { ...agendaitem.attributes, ...agendaitem.highlight };
    entry.id = agendaitem.id;
    await SearchDecisionsRoute.postProcessDecisions(entry, store);
    return entry;
  };

  static async createFilter(params, store) {
    const searchModifier = ':sqs:';
    const textSearchKey = SearchDecisionsRoute.textSearchFields.join(',');

    const filter = {};

    filter[`${searchModifier}${textSearchKey}`] = isEmpty(params.searchText)
    ? '*'
    : filterStopWords(params.searchText);

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

    // Since all agendaitem versions point to the same treatment, only use latest agendaitems
    filter[':has-no:nextVersionId'] = 't';
    // only show results with a decision present
    filter[':has:decisionName'] = 't';

    if (params.decisionResults?.length) {
      const decisionResults = (
        await Promise.all(
          params.decisionResults
                .map((id) => store.findRecord('concept', id)))
      ).map((record) => record.uri);
      filter[':terms:decisionResult'] = decisionResults;
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

    if (!params.dateFrom) {
      params.dateFrom = null;
    }
    if (!params.dateTo) {
      params.dateTo = null;
    }
    if (!params.mandatees) {
      params.mandatees = null;
    }

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'page')
      )
    ) {
      params.page = 0;
    }

    const filter = await SearchDecisionsRoute.createFilter(params, this.store);

    this.lastParams.commit();

    // Since we want to show the decisions in their agendaitem, we query for
    // agendaitems here while only filtering on decision data, so that we can
    // easily link to the agendaitem route
    const results = search(
      'agendaitems',
      params.page,
      params.size,
      params.sort,
      filter,
      (decision) => SearchDecisionsRoute.postProcessData(decision, this.store),
      {
        fields: SearchDecisionsRoute.highlightFields,
      }
    );

    this.trackSearch(
      params.searchText,
      results.length,
      params.mandatees,
      params.decisionResults,
      params.dateFrom,
      params.dateTo,
      params.sort,
    );

    return results;
  }

  async trackSearch(searchTerm, resultCount, mandatees, decisionResults, from, to, sort) {
    const ministerNames = (
      await Promise.all(
        mandatees?.map((id) => this.store.findRecord('person', id)))
    ).map((person) => person.fullName);

    const decisionResultNames = (
      await Promise.all(
        decisionResults?.map((id) => this.store.findRecord('concept', id)))
    ).map((decisionResultCode) => decisionResultCode.label);

    this.plausible.trackEventWithRole('Zoekopdracht', {
      'Zoekterm': searchTerm,
      'Ministers': ministerNames.join(', '),
      'Van': from,
      'Tot en met': to,
      'Sorteringsoptie': sort,
      'Aantal resultaten': resultCount,
      'Resultaat beslissing': decisionResultNames.join(', '),
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

  static async postProcessDecisions(entry, store) {
    if (entry.decisionResult) {
      entry.decisionResult = await store.findRecordByUri(
        'concept',
        entry.decisionResult
      );
    }
  }

  static postProcessHighlights(entry) {
    if (Array.isArray(entry.highlight?.subcaseTitle)) {
      entry.highlight.subcaseTitle = entry.highlight.subcaseTitle[0];
    }

    if (Array.isArray(entry.highlight?.subcaseShortTitle)) {
      entry.highlight.subcaseShortTitle = entry.highlight.subcaseShortTitle[0];
    }
  }
}
