import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { dasherize } from '@ember/string';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';

export default class PublicationsIndexRoute extends Route {
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
  }

  statusFilters = Object.freeze({ // map filter name to concept uri
    publishedFilterOption: CONSTANTS.PUBLICATION_STATUSES.PUBLISHED,
    pausedFilterOption: CONSTANTS.PUBLICATION_STATUSES.PAUSED,
    withdrawnFilterOption: CONSTANTS.PUBLICATION_STATUSES.WITHDRAWN,
    toPublishFilterOption: CONSTANTS.PUBLICATION_STATUSES.PENDING,
  });

  beforeModel() {
    this.publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});
  }

  async model(params) {
    const statusIds = [];
    let ministerFilter = {};

    for (const statusFilter of Object.keys(this.statusFilters)) {
      if (this.publicationFilter[statusFilter]) {
        const status = await this.store.findRecordByUri('publication-status', this.statusFilters[statusFilter]);
        statusIds.push(status.id);
      }
    }

    if (!(this.publicationFilter.ministerFilterOption && this.publicationFilter.notMinisterFilterOption)) {
      if (this.publicationFilter.ministerFilterOption) {
        ministerFilter = {
          ':has:subcases': 'yes',
        };
      }
      if (this.publicationFilter.notMinisterFilterOption) {
        ministerFilter = {
          ':has-no:subcases': 'yes',
        };
      }
    }

    const filter = {
      ':has:case': 'yes',
    };

    if (ministerFilter) {
      filter.case = ministerFilter;
    }

    if (statusIds.length > 0) {
      filter.status = {
        ':id:': statusIds.join(','),
      };
    }

    let apiSort;
    let qpSort = params.sort;
    let descending;
    if (qpSort) {
      if (qpSort.startsWith('-')) {
        descending = true;
        qpSort = qpSort.replace(/(^\+)|(^-)/g, '');
      } else {
        descending = false;
      }
      // note that the "dasherize" here is used in order to keep the original column keyName's
      if (qpSort === dasherize('publicationNumber')) {
        // show the most recent publication first if publication-number is the same
        apiSort = 'identification.structured-identifier.local-identifier,-created';
      } else if (qpSort === dasherize('regulationType')) {
        apiSort = 'regulation-type.position';
      } else if (qpSort === dasherize('requestedPublicationDate')) {
        apiSort = 'publish-before';
      } else if (qpSort === dasherize('publicationDate')) {
        apiSort = 'published-at';
      } else if (qpSort === dasherize('lastEdited')) {
        apiSort = 'modified';
      } else if (qpSort === dasherize('withdrawnDate') || qpSort === dasherize('pauseDate')) {
        // TODO: might want to sort on status too, since bot withdrawal & pause use the same sort field behind the scenes
        apiSort = 'publication-status-change.started-at';
      }
      if (apiSort && descending) {
        apiSort = `-${apiSort}`;
      }
    }

    return this.store.query('publication-flow', {
      filter: filter,
      sort: apiSort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: 'case,status,identification,identification.structured-identifier',
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
