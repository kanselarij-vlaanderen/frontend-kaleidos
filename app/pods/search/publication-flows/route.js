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
import {
  getPublicationStatusPillKey,
  getPublicationStatusPillStep
} from 'frontend-kaleidos/utils/publication-auk';

export default class PublicationFlowSearchRoute extends Route {
  @service store;

  queryParams = {
    regulationTypeIds: {
      refreshModel: true,
      as: 'types_regelgeving',
    },
    publicationStatusIds: {
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

  async postProcessStatus(pubFlow) {
    const {
      statusId,
    } = pubFlow.attributes;
    if (statusId) {
      pubFlow.attributes.status = await this.store.findRecord('publication-status', statusId);
      pubFlow.attributes.statusPillKey = getPublicationStatusPillKey(pubFlow.attributes.status);
      pubFlow.attributes.statusPillStep = getPublicationStatusPillStep(pubFlow.attributes.status);
    }
  }

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async beforeModel() {
    this.publicationStatuses = await this.store.findAll('publication-status'); // TODO convert to not use findAll
    this.regulationTypes = await this.store.findAll('regulation-type');
  }

  model(filterParams) {
    const searchParams = this.paramsFor('search');
    const params = {...searchParams, ...filterParams}; // eslint-disable-line

    this.lastParams.stageLive(params);

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }

    const textSearchFields = ['title', 'shortTitle', 'identification', 'numacNumbers'];

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
    if (!isEmpty(params.date)) {
      const from = moment(params.date, 'DD-MM-YYYY').startOf('day');
      const to = moment(params.date, 'DD-MM-YYYY').endOf('day'); // "To" interpreted as inclusive
      filter[':lte,gte:' + params.publicationDateTypeKey] = [
        to.utc().toISOString(),
        from.utc().toISOString(),
      ].join(',');
    }

    // ":terms:" required to be able to filter on multiple values as "OR"
    if (!isEmpty(params.regulationTypeIds)) {
      filter[':terms:regulationTypeId'] = params.regulationTypeIds.join(',');
    }

    if (!isEmpty(params.publicationStatusIds)) {
      filter[':terms:statusId'] = params.publicationStatusIds;
    }

    this.lastParams.commit();

    if (isEmpty(params.searchText)) {
      return [];
    }

    return search('publication-flows', params.page, params.size, params.sort, filter, (async (searchData) => {
      const entry = searchData.attributes;
      entry.id = searchData.id;
      this.postProcessDates(searchData);
      await this.postProcessStatus(searchData);
      return entry;
    }).bind(this));
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.emptySearch = isEmpty(this.paramsFor('search').searchText);

    controller.publicationStatuses = this.publicationStatuses;
    controller.regulationTypes = this.regulationTypes;

    if (controller.page !== this.lastParams.committed.page) {
      controller.page = this.lastParams.committed.page;
    }
  }
}
