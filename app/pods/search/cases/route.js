/* eslint-disable class-methods-use-this */
import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import moment from 'moment';
import search from 'fe-redpencil/utils/mu-search';
import Snapshot from 'fe-redpencil/utils/snapshot';
import { inject as service } from '@ember/service';

export default class CasesSearchRoute extends Route {
  @service metrics;
  queryParams = {
    // isArchived: {
    //   refreshModel: true
    // },
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
    const params = {...searchParams, ...filterParams}; // eslint-disable-line
    this.lastParams.stageLive(params);

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }

    const textSearchFields = ['title', 'shortTitle', 'subcaseTitle', 'subcaseSubTitle'];
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
      filter['creators,mandatees,mandateeFirstNames,mandateeFamilyNames'] = params.mandatees;
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

    // Param below not yet in use, since it isn't indexed
    // if (this.isArchived) {
    //   filter['isArchived'] = 'true';
    // }

    this.lastParams.commit();

    if (isEmpty(params.searchText)) {
      return [];
    }

    const {
      postProcessDates,
    } = this;
    return search('cases', params.page, params.size, params.sort, filter, (searchData) => {
      const entry = searchData.attributes;
      entry.id = searchData.id;
      postProcessDates(searchData);
      return entry;
    });
  }

  afterModel(model) {
    const keyword = this.paramsFor('search').searchText;
    let count;
    if (model && model.meta && typeof model.meta.count === 'undefined') {
      count = model.meta.count;
    } else {
      count = false;
    }
    this.metrics.invoke('trackSiteSearch', {
      keyword,
      category: 'CasesSearch',
      searchCount: count,
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.emptySearch = isEmpty(this.paramsFor('search').searchText);

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
  }
}
