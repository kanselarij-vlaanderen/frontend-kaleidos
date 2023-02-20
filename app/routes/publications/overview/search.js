import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import search from 'frontend-kaleidos/utils/mu-search';
import Snapshot from 'frontend-kaleidos/utils/snapshot';
import { inject as service } from '@ember/service';
import {
  getPublicationStatusPillKey,
  getPublicationStatusPillStep
} from 'frontend-kaleidos/utils/publication-auk';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { warn } from '@ember/debug';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import parseDate from '../../../utils/parse-date-search-param';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';

export default class PublicationsOverviewSearchRoute extends Route {
  @service store;
  @service router;
  @service currentSession;

  queryParams = {
    searchText: {
      refreshModel: true,
      as: 'zoekterm',
    },
    dateFrom: {
      refreshModel: true,
      as: 'vanaf',
    },
    dateTo: {
      refreshModel: true,
      as: 'tot',
    },
    publicationDateTypeKey: {
      refreshModel: true,
      as: 'datum_type',
    },
    mandatees: {
      refreshModel: true,
      as: 'ministers',
    },
    regulationTypeIds: {
      refreshModel: true,
      as: 'types_regelgeving',
    },
    publicationStatusIds: {
      refreshModel: true,
      as: 'statussen',
    },
    urgentOnly: {
      refreshModel: true,
      as: 'dringend',
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

  constructor() {
    super(...arguments);
    this.lastParams = new Snapshot();
  }

  async beforeModel() {
    if (!this.currentSession.may('search-publication-flows')) {
      this.router.transitionTo('agendas');
      return;
    }
    this.publicationStatuses = await this.store.query('publication-status', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    this.regulationTypes = await this.store.query('regulation-type', {
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
    this.urgencyLevelSpeed = await this.store.findRecordByUri(
      'urgency-level',
      CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE,
    );
  }

  model(filterParams) {
    const params = {...filterParams};
    this.filterParams = filterParams;

    this.lastParams.stageLive(params);

    if (this.lastParams.anyFieldChanged(Object.keys(params).filter((key) => key !== 'page'))) {
      params.page = 0;
    }
    const textSearchFields = ['title', 'shortTitle', 'identification', 'numacNumbers'];

    const searchModifier = ':sqs:';
    const textSearchKey = textSearchFields.join(',');

    const filter = {};

    const searchText = isEmpty(params.searchText) ? '*' : params.searchText;
    filter[searchModifier + textSearchKey] = searchText;


    /* A closed range is treated as something different than 2 open ranges because
     * mu-search(/elastic?) (semtech/mu-search:0.6.0-beta.11, semtech/mu-search-elastic-backend:1.0.0)
     * returns an off-by-one result (1 to many) in case of two open ranges combined.
     */
    if (isPresent(params.dateFrom) && isPresent(params.dateTo)) {
      const from = startOfDay(parseDate(params.dateFrom));
      const to = endOfDay(parseDate(params.dateTo)); // "To" interpreted as inclusive
      filter[':lte,gte:' + params.publicationDateTypeKey] = [to.toISOString(), from.toISOString()].join(',');
    } else if (isPresent(params.dateFrom)) {
      const date = startOfDay(parseDate(params.dateFrom));
      filter[':gte:' + params.publicationDateTypeKey] = date.toISOString();
    } else if (isPresent(params.dateTo)) {
      const date = endOfDay(parseDate(params.dateTo)); // "To" interpreted as inclusive
      filter[':lte:' + params.publicationDateTypeKey] = date.toISOString();
    }

    // ":terms:" required to be able to filter on multiple values as "OR"
    if (isPresent(params.regulationTypeIds)) {
      filter[':terms:regulationTypeId'] = params.regulationTypeIds.join(',');
    }

    if (isPresent(params.publicationStatusIds)) {
      filter[':terms:statusId'] = params.publicationStatusIds;
    }

    if (!isEmpty(params.mandatees)) {
      filter[':terms:mandateeIds'] = params.mandatees;
    }

    if (params.urgentOnly) {
      filter['urgencyLevelId'] = this.urgencyLevelSpeed.id;
    }

    this.lastParams.commit();

    return search('publication-flows', params.page, params.size, params.sort, filter, (searchData) => {
      const entry = searchData.attributes;
      entry.id = searchData.id;
      this.postProcessSearchEntry(entry);
      return entry;
    });
  }

  /* There is no reset of query parameters here by means of "resetController".
   * It is assumed that -unless users explicitly click the main "search" button-
   * search state (term, page number, ...) should be remembered, especially with
   * a trial-and-error search-session in mind, where users navigate to a detail item,
   * realize it's not what they're looking for and go back in history.
   */

  setupController(controller, model) {
    super.setupController(controller, model);
    const params = this.filterParams;
    controller.searchTextBuffer = params.searchText;
    controller.page = params.page;
    controller.dateFromBuffer = parseDate(params.dateFrom);
    controller.dateToBuffer = parseDate(params.dateTo);
    controller.publicationStatuses = this.publicationStatuses.toArray();
    controller.regulationTypes = this.regulationTypes.toArray();
    controller.mandatees = params.mandatees;
    controller.loadMinisters.perform();

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
    // Disable bubbling of loading event to prevent parent loading route to be shown.
    // Otherwise it causes a 'flickering' effect because the search filters disappear.
    return false;
  }

  postProcessSearchEntry(attributes) {
    // post-process publication-status
    let statusId = attributes.statusId;
    if (statusId) {
      const hasMultipleStatuses = Array.isArray(statusId);
      if (hasMultipleStatuses) {
        // due to inserts of double statuses we take the first one to not break the search
        statusId = statusId.firstObject;
        warn(`Publication flow ${attributes.id} contains multiple statusses in search index`, !hasMultipleStatuses, { id: 'search.invalid-data' });
      }
      const status = this.publicationStatuses.find((status) => status.id === statusId);
      attributes.status = status;
      attributes.statusPillKey = getPublicationStatusPillKey(status);
      attributes.statusPillStep = getPublicationStatusPillStep(status);
    }
    let urgencyLevelId = attributes.urgencyLevelId;
    if (urgencyLevelId) {
      attributes.urgent = urgencyLevelId === this.urgencyLevelSpeed.id;
    }
    // post-process numac numbers
    if (!attributes.numacNumbers) {
      attributes.numacNumbers = [];
    } else if (!Array.isArray(attributes.numacNumbers)) {
      attributes.numacNumbers = [attributes.numacNumbers];
    }
  }
}
