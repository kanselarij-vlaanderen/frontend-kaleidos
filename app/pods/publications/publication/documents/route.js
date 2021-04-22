import Route from '@ember/routing/route';
import task from 'ember-concurrency';

export default class PublicationDocumentsRoute extends Route {
  queryParams = {
    documentTypes : {
      type: 'array',
      as: 'document-type',
    },
  }

  async model(params) {
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
    this.loadDocumentTypesTask.perform();
    this.loadFileTypesTask.perform();
  }

  @task
  *loadDocumentTypesTask() {
    this.documentTypes = yield this.store.query('document-type', {
      page: {
        size: 50,
      },
      sort: 'priority',
    });
    return this.documentTypes;
  }

  @task
  *loadFileTypesTask() {
    this.fileTypes = yield this.fileService.getFileExtensions();
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup({
      _case: this.case,
    });
  }

  resetController(controller) {
    controller.reset();
  }
}
