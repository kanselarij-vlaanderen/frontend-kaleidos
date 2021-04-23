import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { set } from '@ember/object';
import { all as allPromises } from 'rsvp';
// import task, { all as allTasks } from 'ember-concurrency';

export default class PublicationDocumentsRoute extends Route {
  @inject store;
  @inject fileService;

  queryParamConstants = {
    documentTypes: 'filterQueryParams$documentTypes',
    documentName: 'filterQueryParams$documentName',
    fileTypes: 'filterQueryParams$fileTypes'
  }

  queryParams = {
    [this.queryParamConstants.documentName]: {
      as: 'naam',
      refreshModel: true,
    },
    [this.queryParamConstants.fileTypes]: {
      as: 'bestandstype',
      refreshModel: true,
    },
    [this.queryParamConstants.documentTypes]: {
      as: 'type',
      refreshModel: true,
    },
  }

  deserializeQueryParams(params) {
    const KEY_DOCUMENT_TYPES = this.queryParamConstants.documentTypes;
    const KEY_DOCUMENT_NAME = this.queryParamConstants.documentName;
    const KEY_FILE_TYPES = this.queryParamConstants.fileTypes;

    const documentTypeIds = params[KEY_DOCUMENT_TYPES] ? params[KEY_DOCUMENT_TYPES].split(',') : [];
    const documentName = params[KEY_DOCUMENT_NAME];
    const fileTypeIds = params[KEY_FILE_TYPES] ? params[KEY_FILE_TYPES].split(',') : [];

    const deserializedParams = {
      documentTypes: documentTypeIds,
      documentName,
      fileTypes: fileTypeIds,
    };

    return deserializedParams;
  }

  async queryParamsToFilter(params) {
    const documentTypes = params.documentTypes.map((id) => this.store.findRecord('document-type', id));
    const fileTypes = params.fileTypes.map((id) => this.store.findRecord('file-type', id));

    const filter = {
      documentName: params.documentName,
      fileTypes: await allPromises(fileTypes),
      documentTypes: await allPromises(documentTypes),
    };

    return filter;
  }

  filterToQueryParams(filter) {
    const params = {
      documentName: filter.documentName,
      documentTypes: filter.documentTypes.map((it) => it.id).join(','),
      fileTypes: filter.fileTypes.map((it) => it.id).join(','),
    };

    return params;
  }

  reloadModel() {
    const params = this.filterToQueryParams(this.controller.filter);
    for (const key in this.queryParamConstants) {
      set(this.controller, key, params.documentTypes);
    }
  }

  async model(params) {
    this.documentTypes = await this.loadDocumentTypes();
    this.fileTypes = await this.loadFileTypes();

    const deserializedParams = this.deserializeQueryParams(params);
    this.filter = await this.queryParamsToFilter(deserializedParams);

    const parentHash = this.modelFor('publications.publication');
    const _case = parentHash.case;

    const storeQueryFilter = {
      cases: {
        id: _case.get('id'),
      },
    };
    if (this.filter.documentTypes.length) {
      storeQueryFilter['document-container'] = {
        type: {
          id: this.filter.documentTypes.map((it) => it.id).join(','),
        },
      };
    }

    const modelData = await this.store.query('piece', {
      include: 'cases,document-container,document-container.type,file,agendaitems',
      reload: true,
      filter: storeQueryFilter,
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
