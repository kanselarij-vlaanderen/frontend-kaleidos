/* eslint-disable class-methods-use-this */
import Route from '@ember/routing/route';
import {
  isEmpty,
  isPresent
} from '@ember/utils';
import moment from 'moment';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import { inject as service } from '@ember/service';

export default class AgendaitemSearchRoute extends Route {
  @service metrics;
  queryParams = {
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

  textSearchFields = Object.freeze(['title', 'subTitle', 'data.content', 'richtext', 'themes','decisionStatusLabel']);

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  postProcessDates(_case) {
    const {
      publicationDate,
    } = _case.attributes;
    if (publicationDate) {
      if (Array.isArray(publicationDate)) {
        const sorted = publicationDate.sort();
        _case.attributes.publicationDate = sorted[sorted.length - 1];
      } else {
        _case.attributes.publicationDate = moment(publicationDate);
      }
    }
  }

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = {...searchParams, ...filterParams}; // eslint-disable-line
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

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }

    const searchModifier = ':sqs:';
    const textSearchKey = this.textSearchFields.join(',');

    const filter = {};

    if (!isEmpty(params.searchText)) {
      filter[`${searchModifier}${textSearchKey}`] = params.searchText;
    }
    if (!isEmpty(params.mandatees)) {
      filter['mandateeName,mandateeFirstNames,mandateeFamilyNames'] = params.mandatees;
    }

    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (!isEmpty(params.dateFrom) && !isEmpty(params.dateTo)) {
      const from = moment(params.dateFrom, 'DD-MM-YYYY').startOf('day');
      const to = moment(params.dateTo, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte,gte:publicationDate'] = [to.utc().toISOString(), from.utc().toISOString()].join(',');
    } else if (!isEmpty(params.dateFrom)) {
      const date = moment(params.dateFrom, 'DD-MM-YYYY').startOf('day');
      filter[':gte:publicationDate'] = date.utc().toISOString();
    } else if (!isEmpty(params.dateTo)) {
      const date = moment(params.dateTo, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte:publicationDate'] = date.utc().toISOString();
    }

    // filter kort bestekken die enkel aan agenda's hangen
    filter[':has-no:generalNewsletterMeetingId'] = 't';

    this.lastParams.commit();
    console.log(params.sort)
    if (isEmpty(params.searchText)) {
      return [];
    }
    return search('newsletter-infos', params.page, params.size, params.sort, filter, (newsletters) => {
      const entry = newsletters.attributes;
      entry.id = newsletters.id;
      return entry;
    });
  }

  afterModel(model) {
    const keyword = this.paramsFor('search').searchText;
    let count;
    if (model && model.meta && isPresent(model.meta.count)) {
      count = model.meta.count;
    } else {
      count = false;
    }
    this.metrics.invoke('trackSiteSearch', {
      keyword,
      category: 'newslettersSearch',
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
