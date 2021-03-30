import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
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
    const filterOptionKeys = new PublicationFilter(JSON.parse(localStorage.getItem('filterOptions')) || {});
    const ids = [];
    let ministerFilter = {};

    if (filterOptionKeys.publishedFilterOption) {
      ids.push(CONFIG.publicationStatusPublished.id);
    }
    if (filterOptionKeys.pausedFilterOption) {
      ids.push(CONFIG.publicationStatusPauzed.id);
    }
    if (filterOptionKeys.withdrawnFilterOption) {
      ids.push(CONFIG.publicationStatusWithdrawn.id);
    }
    if (filterOptionKeys.toPublishFilterOption) {
      ids.push(CONFIG.publicationStatusToPublish.id);
    }
    if (!(filterOptionKeys.ministerFilterOption && filterOptionKeys.notMinisterFilterOption)) {
      if (filterOptionKeys.ministerFilterOption) {
        ministerFilter = {
          ':has:subcases': 'yes',
        };
      }
      if (filterOptionKeys.notMinisterFilterOption) {
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
    let sort;
    if (typeof params.sort === 'string' && params.sort.includes('publication-number')) {
      // Specifically requested by Johan, because Suffix needs to be string and Quater...
      sort = `${params.sort},-created`;
    } else {
      sort = params.sort;
    }

    return this.store.query('publication-flow', {
      filter: filter,
      sort: sort,
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
