import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import DocumentsFilter from 'frontend-kaleidos/utils/documents-filter';
import FilterQueryParams from './filter-query-params';

export default class PublicationDocumentsRoute extends Route {
  @inject store;
  @inject fileService;

  queryParams = {
    ...FilterQueryParams.queryParams,
  };

  async model(params) {
    // caching for use in QueryParams.queryParamsToFilter
    // and use them in DocumentsFilterComponent
    this.documentTypes = await this._loadDocumentTypes();
    this.filter = await FilterQueryParams.readToFilter(this.store, params);
    this.case  = this.modelFor('publications.publication').case;

    const modelData = await this._loadModel(this.case, this.filter);

    // use array to allow iteration (for sorting)
    return modelData.toArray();
  }

  async _loadModel(_case, filter) {
    const storeQueryFilter = {
      'filter[cases][:id:]': _case.id,
    };
    if (filter.documentTypes.length) {
      storeQueryFilter['filter[document-container][type][:id:]'] = filter.documentTypes.map((it) => it.id).join(',');
    }
    // TODO: FIGURE OUT. THIS DOES NOT WORK YET FOR MULTIPLE FILE TYPES
    // temporary solution: frontend filtering in controller.sortAndFilterPieces
    // if (filter.fileTypes.length) {
    //   storeQueryFilter['filter[file][extension]'] = ?
    // }
    if (filter.documentName) {
      storeQueryFilter['filter[name]'] = filter.documentName;
    }

    const modelData = await this.store.query('piece', {
      include: 'cases,document-container,document-container.type',
      ...storeQueryFilter,
    });

    return modelData;
  }

  async _loadDocumentTypes() {
    return await this.store.query('document-type', {
      page: {
        size: 50,
      },
      sort: 'priority',
    });
  }

  // note: setupController is not awaited by Ember
  async setupController(controller) {
    super.setupController(...arguments);
    controller.case = this.case;
    controller.documentTypes = this.documentTypes;
    controller.filter = new DocumentsFilter(this.filter);
    await controller.sortAndFilterPieces();
    controller.isLoaded = true;
  }

  resetController(controller) {
    controller.newPieces = [];
    controller.filter.reset();
    controller.selectedPieces = [];
    controller.filteredSortedPices = [];
    controller.isLoaded = false;
  }

  @action
  refresh() {
    super.refresh();
  }
}
