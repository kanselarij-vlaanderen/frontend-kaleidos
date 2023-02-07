import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { parse, startOfDay, endOfDay } from 'date-fns';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaitemSearchRoute extends Route {
  queryParams = {
    types: {
      refreshModel: true,
    },
    latestOnly: {
      refreshModel: true,
      as: 'uitsluitend-laatste-versie',
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

  textSearchFields = [
    'title^4',
    'shortTitle^4',
    'mandateRoles^2',
    'mandateeFirstNames^3',
    'mandateeFamilyNames^3',
    'pieceNames^2',
    'pieceFileNames^2',
    'pieces.content',
    'decisionName^2',
    'decisionFileName^2',
    'decision.content',
    'newsItemTitle^2',
    'newsItem',
  ];

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = { ...searchParams, ...filterParams };
    if (!params.dateFrom) {
      params.dateFrom = null;
    }
    if (!params.dateTo) {
      params.dateTo = null;
    }
    if (!params.mandatees) {
      params.mandatees = null;
    }
    this.lastParams.stageLive(params);

    if (
      this.lastParams.anyFieldChanged(
        Object.keys(params).filter((key) => key !== 'page')
      )
    ) {
      params.page = 0;
    }

    const searchModifier = ':sqs:';
    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[`${searchModifier}${textSearchKey}`] = params.searchText;
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

    if (params.types.length) {
      if (
        params.types.includes('nota') &&
        !params.types.includes('mededeling')
      ) {
        filter.type = CONSTANTS.AGENDA_ITEM_TYPES.NOTA;
      } else if (
        params.types.includes('mededeling') &&
        !params.types.includes('nota')
      ) {
        filter.type = CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
      }
    }

    if (params.latestOnly) {
      filter[':has-no:nextVersionId'] = 't';
    }

    this.lastParams.commit();

    if (isEmpty(params.searchText)) {
      return [];
    }
    return search(
      'agendaitems',
      params.page,
      params.size,
      params.sort,
      filter,
      (agendaitem) => {
        const entry = agendaitem.attributes;
        entry.id = agendaitem.id;
        return entry;
      }
    );
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
