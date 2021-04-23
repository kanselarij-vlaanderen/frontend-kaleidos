import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import FilterQueryParams from './filter-query-params';

export default class PublicationDocumentsRoute extends Route {
  @inject store;
  @inject fileService;

  queryParams = FilterQueryParams.queryParams;

  controllerArgs = {}

  async model(params) {
    // caching for use in QueryParams.queryParamsToFilter
    // and use them in DocumentsFilterComponent
    const documentTypes = await this._loadDocumentTypes();

    const filter = await FilterQueryParams.readToFilter(this.store, params);

    const parentHash = this.modelFor('publications.publication');
    const _case = parentHash.case;

    const storeQueryFilter = {};
    storeQueryFilter['filter[cases][:id:]'] = _case.get('id');
    if (filter.documentTypes.length) {
      storeQueryFilter['filter[document-container][type][:id:]'] = filter.documentTypes.map((it) => it.id).join(',');
    }
    // TODO: FIGURE OUT. THIS DOES NOT WORK YET FOR MULTIPLE FILE TYPES
    // temporary solution: frontend filtering in controller.sortAndFilterPieces
    // if (filter.fileTypes.length) {
    //   storeQueryFilter['filter[file][extension]'] = filter.fileTypes.join(',');
    // }
    if (filter.documentName) {
      storeQueryFilter['filter[name]'] = filter.documentName;
    }

    const modelData = await this.store.query('piece', {
      include: 'cases,document-container,document-container.type',
      reload: true,
      ...storeQueryFilter,
    });

    this.controllerArgs.case = _case;
    this.controllerArgs.documentTypes = documentTypes;
    this.controllerArgs.filter = filter;

    // use array to allow add/delete
    return modelData.toArray();
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup(
      {
        _case: this.controllerArgs.case,
        documentTypes: this.controllerArgs.documentTypes,
      },
      this.controllerArgs.filter
    );
  }

  resetController(controller) {
    controller.reset();
  }

  async _loadDocumentTypes() {
    return await this.store.query('document-type', {
      page: {
        size: 50,
      },
      sort: 'priority',
    });
  }
}
