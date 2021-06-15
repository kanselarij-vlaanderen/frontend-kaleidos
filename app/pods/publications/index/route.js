import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
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
    const filter = {
      ':has:case': 'yes',
    };
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
    if (ministerFilter) {
      filter.case = ministerFilter;
    }
    if (statusIds.length > 0) {
      filter.status = {
        ':id:': statusIds.join(','),
      };
    }
    return this.store.query('publication-flow', {
      filter: filter,
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: [
        'case',
        'status',
        'identification.structured-identifier',
        'urgency-level',
        'regulation-type',
        'publication-status-change',
        'numac-numbers',
        'publication-subcase',
        'translation-subcase',
        'agenda-item-treatment'
      ].join(','),
    });
  }

  @action
  loading(transition) {
    const controller = this.controllerFor('publications.index');
    controller.isLoadingModel = true;
    transition.promise.finally(() => {
      controller.isLoadingModel = false;
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
