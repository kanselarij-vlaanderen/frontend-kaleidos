import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import QueryParams from './filter-query-params';

export default class PublicationDocumentsRoute extends Route {
  @inject store;
  @inject fileService;

  queryParamConstants = {
    documentTypes: 'filterQueryParams$documentTypes',
    documentName: 'filterQueryParams$documentName',
    fileTypes: 'filterQueryParams$fileTypes',
  }

  queryParams = QueryParams.queryParams;

  controllerArgs = {}

  async model(params) {
    this.documentTypes = await this.loadDocumentTypes();
    this.fileTypes = await this.loadFileTypes();

    const deserializedParams = QueryParams.deserializeQueryParams(params);
    const filter = await QueryParams.queryParamsToFilter(this.store, deserializedParams);

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
      include: 'cases,document-container,document-container.type,file,agendaitems',
      reload: true,
      ...storeQueryFilter,
    });

    this.controllerArgs.filter = filter;
    // use array to allow add/delete
    return modelData.toArray();
  }

  async afterModel() {
    const parentHash = this.modelFor('publications.publication');
    this.controllerArgs.case = parentHash.case;
    // const documentTypes = this.LoadDocumentTypesTask();
    // const fileTypesTask = this.LoadFileTypesTask();

    const documentTypes = this.loadDocumentTypes();
    const fileTypesTask = this.loadFileTypes();

    await Promise.all([documentTypes, fileTypesTask]);
  }

  async loadDocumentTypes() {
    this.documentTypes = await this.store.query('document-type', {
      page: {
        size: 50,
      },
      sort: 'priority',
    });
  }

  async loadFileTypes() {
    this.fileTypes = await this.fileService.getFileExtensions();
  }

  // @task
  // *LoadDocumentTypesTask() {
  //   this.documentTypes = yield this.store.query('document-type', {
  //     page: {
  //       size: 50,
  //     },
  //     sort: 'priority',
  //   });
  // }

  // @task
  // *LoadFileTypesTask() {
  //   this.fileTypes = yield this.fileService.getFileExtensions();
  // }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup(
      {
        _case: this.controllerArgs.case,
      },
      this.controllerArgs.filter
    );
  }

  resetController(controller) {
    controller.reset();
  }
}
