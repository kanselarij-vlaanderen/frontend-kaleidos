import Route from '@ember/routing/route';
import { action } from '@ember/object';
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

  beforeModel() {
    this.publicationFilter = new PublicationFilter(JSON.parse(localStorage.getItem('publicationFilter')) || {});
  }

  async model(params) {
    let ministerFilter = {};
    const filter = {
      ':has:case': 'yes',
    };

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

    return this.store.query('publication-flow', {
      filter: filter,
      sort: params.sort,
      page: {
        number: params.page,
        size: params.size,
      },
      include: [
        'publication-subcase',
        'translation-subcase',
        'case'
      ].join(','),
    });
  }

  @action
  loading(transition) {
    // see snippet in https://api.emberjs.com/ember/3.27/classes/Route/events/loading?anchor=loading
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller = this.controllerFor('publications.index.index');
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
