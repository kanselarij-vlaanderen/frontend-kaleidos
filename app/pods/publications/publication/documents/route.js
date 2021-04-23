import Route from '@ember/routing/route';
import { inject } from '@ember/service';
// import task, { all as allTasks } from 'ember-concurrency';

export default class PublicationDocumentsRoute extends Route {
  @inject store;
  @inject fileService;

  queryParams = {
    ['filterQueryParams.documentName']: {
      as: 'naam',
      refreshModel: true,
    },
    ['filterQueryParams.fileTypes']: {
      as: 'bestandstype',
      refreshModel: true,
    },
    ['filterQueryParams.documentTypes']: {
      as: 'type',
      refreshModel: true,
    },
  }

  deserializeQueryParams(params) {
    const documentTypeIds = params.documentTypes?.split('&') ?? [];
    const documentName = params.documentName ?? '';
    const fileTypeIds = params.fileTypes?.split('&') ?? [];

    const deserializedParams = {
      documentTypes: documentTypeIds,
      documentName,
      fileTypes: fileTypeIds,
    };

    return deserializedParams;
  }

  queryParamsToFilter(params) {
    const documentTypes = params.documentTypes.map((it) => this.store.findRecord(it.id));
    const fileTypes = params.fileTypes.map((it) => this.store.findRecord(it.id));

    const filter = {
      documentName: params.documentName,
      fileTypes: fileTypes,
      documentTypes: documentTypes,
    };

    return filter;
  }

  filterToQueryParams(filter) {
    const params = {
      documentName: filter.documentName,
      documentTypes: filter.documentTypes.map((it) => it.id).join('&'),
      fileTypes: filter.fileTypes.map((it) => it.id).join('&'),
    };

    return params;
  }

  reloadModel() {
    const params = this.filterToQueryParams(this.controller.filter);
    Object.assign(this.controller.filterQueryParams, params);
    // for (const [key, value] in Object.entries(params)) {
    //   this.controller.filterQueryParams[key] = value;
    // }
  }

  async model(params) {
    console.log(params);
    this.documentTypes = await this.loadDocumentTypes();
    this.fileTypes = await this.loadFileTypes();

    this.filter = this.deserializeQueryParams(params);

    const parentHash = this.modelFor('publications.publication');
    const _case = parentHash.case;
    const modelData = await this.store.query('piece', {
      include: 'cases,document-container,document-container.type',
      reload: true,
      filter: {
        cases: {
          id: _case.get('id'),
        },
      },
    });
    // use array to allow add/delete
    return modelData.toArray();
  }

  async afterModel() {
    const parentHash = this.modelFor('publications.publication');
    this.case = parentHash.case;
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
        _case: this.case,
      },
      this.filter,
      this.reloadModel.bind(this)
    );
  }

  resetController(controller) {
    controller.reset();
  }
}
