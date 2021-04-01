import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
import { dasherize } from '@ember/string';
import PublicationFilter from 'frontend-kaleidos/utils/publication-filter';

export default class PublicationsIndexRoute extends Route.extend(AuthenticatedRouteMixin) {
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

  async model(params) {
    const publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});
    const ids = [];
    let ministerFilter = {};

    if (publicationFilter.publishedFilterOption) {
      ids.push(CONFIG.publicationStatusPublished.id);
    }
    if (publicationFilter.pausedFilterOption) {
      ids.push(CONFIG.publicationStatusPauzed.id);
    }
    if (publicationFilter.withdrawnFilterOption) {
      ids.push(CONFIG.publicationStatusWithdrawn.id);
    }
    if (publicationFilter.toPublishFilterOption) {
      ids.push(CONFIG.publicationStatusToPublish.id);
    }
    if (!(publicationFilter.ministerFilterOption && publicationFilter.notMinisterFilterOption)) {
      if (publicationFilter.ministerFilterOption) {
        ministerFilter = {
          ':has:subcases': 'yes',
        };
      }
      if (publicationFilter.notMinisterFilterOption) {
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

    if (ids.length > 0) {
      filter.status = {
        id: ids.join(','),
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
        // Specifically requested by Johan, because Suffix needs to be string and Quater...
        apiSort = 'publication-number,-created';
      } else if (qpSort === dasherize('regulationType')) {
        apiSort = 'regulation-type.position';
      } else if (qpSort === dasherize('requestedPublicationDate')) {
        apiSort = 'publish-before';
      } else if (qpSort === dasherize('publicationDate')) {
        apiSort = 'published-at';
      } else if (qpSort === dasherize('lastEdited')) {
        apiSort = 'modified';
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
      include: 'case,status',
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    const params = this.paramsFor('publications.index');
    controller.page = params.page;
  }
}
