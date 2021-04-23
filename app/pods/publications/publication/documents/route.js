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
    fileTypes: 'filterQueryParams$fileTypes',
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

  controllerArgs = {}

  deserializeQueryParams(params) {
    const KEY_DOCUMENT_TYPES = this.queryParamConstants.documentTypes;
    const KEY_DOCUMENT_NAME = this.queryParamConstants.documentName;
    const KEY_FILE_TYPES = this.queryParamConstants.fileTypes;

    const documentTypeIds = params[KEY_DOCUMENT_TYPES] ? params[KEY_DOCUMENT_TYPES].split(',') : [];
    const documentName = params[KEY_DOCUMENT_NAME];
    const fileExtensions = params[KEY_FILE_TYPES] ? params[KEY_FILE_TYPES].split(',') : [];

    const deserializedParams = {
      documentTypes: documentTypeIds,
      documentName,
      fileTypes: fileExtensions,
    };

    return deserializedParams;
  }

  async queryParamsToFilter(params) {
    const documentTypes = params.documentTypes.map((id) => this.store.findRecord('document-type', id));

    const filter = {
      documentName: params.documentName,
      fileTypes: params.fileTypes,
      documentTypes: await allPromises(documentTypes),
    };

    return filter;
  }

  filterToQueryParams(filter) {
    const params = {
      documentName: filter.documentName,
      documentTypes: filter.documentTypes.map((it) => it.id).join(','),
      fileTypes: filter.fileTypes.join(','),
    };

    return params;
  }

  reloadModel() {
    const params = this.filterToQueryParams(this.controller.filter);
    for (const [key, value] of Object.entries(this.queryParamConstants)) {
      set(this.controller, value, params[key]);
    }
  }

  async model(params) {
    this.documentTypes = await this.loadDocumentTypes();
    this.fileTypes = await this.loadFileTypes();

    const deserializedParams = this.deserializeQueryParams(params);
    const filter = await this.queryParamsToFilter(deserializedParams);

    const parentHash = this.modelFor('publications.publication');
    const _case = parentHash.case;

    // const storeQueryFilter = {
    //   cases: {
    //     id: _case.get('id'),
    //   },
    // };
    const storeQueryFilter = {};
    storeQueryFilter['filter[cases][:id:]'] = _case.get('id');
    if (filter.documentTypes.length) {
      storeQueryFilter['filter[document-container][type][:id:]'] = filter.documentTypes.map((it) => it.id).join(',');
    }
    if (filter.fileTypes.length) {
      // TODO: FIGURE OUT. THIS DOES NOT WORK YET FOR MULTIPLE FILE TYPES
      storeQueryFilter['filter[file][extension]'] = filter.fileTypes.join(',');
      // storeQueryFilter.file = {
      //   extension: ,
      // };
    }
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
      this.controllerArgs.filter,
      this.reloadModel.bind(this)
    );
  }

  resetController(controller) {
    controller.reset();
  }
}
