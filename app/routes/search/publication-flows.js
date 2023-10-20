import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import { startOfDay, endOfDay, parse } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import filterStopWords from 'frontend-kaleidos/utils/filter-stopwords';

export default class SearchPublicationFlowsRoute extends Route {
  queryParams = {
    status: {
      refreshModel: true,
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

  static async postProcessData(data) {
    if (data.highlight?.title) {
      data.highlight.title = data.highlight.title[0];
    }
    if (data.highlight?.shortTitle) {
      data.highlight.shortTitle = data.highlight.shortTitle[0];
    }

    const entry = { ...data.attributes, ...data.highlight };
    entry.id = data.id;

    return entry;
  }

  static createFilter(params) {
    const textSearchFields = [...SearchPublicationFlowsRoute.textSearchFields];
    const searchModifier = ':sqs:';
    const textSearchKey = textSearchFields.join(',');

    const filter = {
      ':has:decisionmakingFlowId': true,
    };

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

    if (params.status) {
      filter.statusId = params.status;
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

    const filter = SearchPublicationFlowsRoute.createFilter(params);

    this.lastParams.commit();

    if (isEmpty(params.searchText)) {
      return [];
    }

    const results = await search(
      'publication-flows',
      params.page,
      params.size,
      params.sort,
      filter,
      SearchPublicationFlowsRoute.postProcessData,
      {
        fields: SearchPublicationFlowsRoute.highlightFields,
      }
    );

    return results;
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
