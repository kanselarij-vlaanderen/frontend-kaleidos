import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { startOfDay, endOfDay, parse } from 'date-fns';
import { inject as service } from '@ember/service';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import filterStopWords from 'frontend-kaleidos/utils/filter-stopwords';
import {
  getPublicationStatusPillKey,
  getPublicationStatusPillStep,
} from 'frontend-kaleidos/utils/publication-auk';
import { warn } from '@ember/debug';

export default class SearchPublicationFlowsRoute extends Route {
  @service store;
  @service plausible;

  queryParams = {
    statuses: {
      refreshModel: true,
      as: 'statussen',
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
    'mandateeFirstNames^3',
    'mandateeFamilyNames^3',
  ];
  static highlightFields = [
    'title',
    'shortTitle',
  ];

  static async postProcessData(data, store) {
    if (data.highlight?.title) {
      data.highlight.title = data.highlight.title[0];
    }
    if (data.highlight?.shortTitle) {
      data.highlight.shortTitle = data.highlight.shortTitle[0];
    }

    let entry = { ...data.attributes, ...data.highlight };
    entry.id = data.id;
    entry = await SearchPublicationFlowsRoute.postProcessPublicationStatus(entry, store);
    return entry;
  }

  static async postProcessPublicationStatus(entry, store) {
    // post-process publication-status
    let statusId = entry.statusId;
    if (statusId) {
      const hasMultipleStatuses = Array.isArray(statusId);
      if (hasMultipleStatuses) {
        // due to inserts of double statuses we take the first one to not break the search
        statusId = statusId.firstObject;
        warn(`Publication flow ${entry.id} contains multiple statusses in search index`, !hasMultipleStatuses, { id: 'search.invalid-data' });
      }
      const status = await store.findRecord('publication-status', statusId);
      entry.status = status;
      entry.statusPillKey = getPublicationStatusPillKey(status);
      entry.statusPillStep = getPublicationStatusPillStep(status);
    }
    return entry;
  }

  static createFilter(params) {
    const textSearchFields = [...SearchPublicationFlowsRoute.textSearchFields];
    const searchModifier = ':sqs:';
    const textSearchKey = textSearchFields.join(',');

    const filter = {
      ':has:decisionmakingFlowId': true,
    };

    filter[`${searchModifier}${textSearchKey}`] = isEmpty(params.searchText)
    ? '*'
    : filterStopWords(params.searchText);

    if (!isEmpty(params.mandatees)) {
      filter[':terms:mandateeIds'] = params.mandatees;
    }

    if (!isEmpty(params.governmentAreas)) {
      filter[':terms:governmentAreaIds'] = params.governmentAreas;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      const to = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte,gte:sessionDate'] = [
        to.toISOString(),
        from.toISOString(),
      ].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = startOfDay(parse(params.dateFrom, 'dd-MM-yyyy', new Date()));
      filter[':gte:sessionDate'] = date.toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = endOfDay(parse(params.dateTo, 'dd-MM-yyyy', new Date())); // "To" interpreted as inclusive
      filter[':lte:sessionDate'] = date.toISOString();
    }

    if (!isEmpty(params.statuses)) {
      filter[':terms:statusId'] = params.statuses;
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

    const filter = SearchPublicationFlowsRoute.createFilter(params);

    this.lastParams.commit();

    const results = await search(
      'publication-flows',
      params.page,
      params.size,
      params.sort,
      filter,
      (publicationFlow) => SearchPublicationFlowsRoute.postProcessData(publicationFlow, this.store),
      {
        fields: SearchPublicationFlowsRoute.highlightFields,
      }
    );

    this.trackSearch(
      params.searchText,
      results.length,
      params.mandatees,
      params.governmentAreas,
      params.statuses,
      params.dateFrom,
      params.dateTo,
      params.sort,
    );

    return results;
  }

  async trackSearch(searchTerm, resultCount, mandatees, governmentAreas, statuses, from, to, sort) {
    const ministerNames = (
      await Promise.all(
        mandatees?.map((id) => this.store.findRecord('person', id)))
    ).map((person) => person.fullName);

    const publicationStatusNames = (
      await Promise.all(
        statuses?.map((id) => this.store.findRecord('publication-status', id)))
    ).map((publicationStatus) => publicationStatus.label);

    const governmentAreaLabels = (
      await Promise.all(
        governmentAreas?.map((id) => this.store.findRecord('concept', id)))
    ).map((concept) => concept.label);  

    this.plausible.trackEventWithRole('Zoekopdracht', {
      'Zoekterm': searchTerm,
      'Ministers': ministerNames.join(', '),
      'Beleidsdomeinen': governmentAreaLabels.join(', '),
      'Van': from,
      'Tot en met': to,
      'Sorteringsoptie': sort,
      'Aantal resultaten': resultCount,
      'Status': publicationStatusNames.join(', '),
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
