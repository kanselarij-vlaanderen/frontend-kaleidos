import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { action } from '@ember/object';
import moment from 'moment';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';

export default class CasesSearchRoute extends Route {
  queryParams = {
    includeArchived: {
      refreshModel: true,
      as: 'incl_gearchiveerd',
    },
    decisionsOnly: {
      refreshModel: true,
      as: 'enkel_beslissingen',
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

  postProcessDates(_case) {
    const {
      sessionDates,
    } = _case.attributes;
    if (sessionDates) {
      if (Array.isArray(sessionDates)) {
        const sorted = sessionDates.sort();
        _case.attributes.sessionDates = sorted[sorted.length - 1];
      } else {
        _case.attributes.sessionDates = moment(sessionDates);
      }
    }
  }

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = {...searchParams, ...filterParams};

    this.lastParams.stageLive(params);

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }

    const textSearchFields = ['title^4', 'shortTitle^4', 'subcaseTitle^2', 'subcaseSubTitle^2'];
    if (params.decisionsOnly) {
      textSearchFields.push('decisions.content');
    } else {
      textSearchFields.push('documents.content');
    }

    const searchModifier = ':sqs:';
    const textSearchKey = textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[searchModifier + textSearchKey] = params.searchText;
    }

    if (!isEmpty(params.mandatees)) {
      filter['mandateeFirstNames,mandateeFamilyNames'] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = moment(params.dateFrom, 'DD-MM-YYYY').startOf('day');
      const to = moment(params.dateTo, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte,gte:sessionDates'] = [to.utc().toISOString(), from.utc().toISOString()].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = moment(params.dateFrom, 'DD-MM-YYYY').startOf('day');
      filter[':gte:sessionDates'] = date.utc().toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = moment(params.dateTo, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte:sessionDates'] = date.utc().toISOString();
    }

    if (!params.includeArchived) {
      filter.isArchived = 'false';
    }

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

    const {
      postProcessDates,
    } = this;
    return search('decisionmaking-flows', params.page, params.size, sort, filter, (searchData) => {
      const entry = searchData.attributes;
      entry.id = searchData.id;
      postProcessDates(searchData);
      return entry;
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.emptySearch = isEmpty(this.paramsFor('search').searchText);

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
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
