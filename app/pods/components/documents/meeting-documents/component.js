import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import config from 'fe-redpencil/utils/config';

export default class MeetingDocuments extends Component {
  @service currentSession;
  @service store;

  @tracked isEnabledDocumentEdit = false;
  @tracked isOpenDocumentUploadModal = false;
  @tracked isOpenLinkedDocumentModal = false;
  @tracked defaultAccessLevel;
  @tracked documents = A([]);
  @tracked newDocuments = A([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.defaultAccessLevel = this.store.peekRecord('access-level', config.internRegeringAccessLevelId);
    if (!this.defaultAccessLevel) {
      const accessLevels = yield this.store.query('access-level', {
        page: {
          size: 1,
        },
        'filter[:id:]': config.internRegeringAccessLevelId,
      });
      this.defaultAccessLevel = accessLevels.firstObject;
    }

    this.documents = yield this.args.meeting.documentVersions; // TODO replace with query?
  }

  @action
  enableDocumentEdit() {
    this.isEnabledDocumentEdit = true;
  }

  @action
  disableDocumentEdit() {
    this.isEnabledDocumentEdit = false;
  }

  @action
  openDocumentUploadModal() {
    this.isOpenDocumentUploadModal = true;
  }

  @action
  uploadDocument(file) {
    const now = moment().utc()
      .toDate();
    const documentContainer = this.store.createRecord('document', {
      created: now,
    });
    const document = this.store.createRecord('document-version', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newDocuments.pushObject(document);
  }

  @task
  *saveDocuments() {
    const savePromises = this.newDocuments.map(async(document) => {
      try {
        this.saveDocument.perform(document);
      } catch (error) {
        this.deleteDocument.perform(document);
        throw error;
      }
    });
    yield all(savePromises);
    this.isOpenDocumentUploadModal = false;
    this.newDocuments = A();
  }

  /**
   * Save a new document container and the document it wraps
  */
  @task
  *saveDocument(document) {
    const documentContainer = yield document.documentContainer;
    yield documentContainer.save();
    yield document.save();
    const documents = yield this.args.meeting.hasMany('documentVersions').reload();
    documents.pushObject(document);
    yield this.args.meeting.save();
  }

  /**
   * Add new document to an existing document container
  */
  @task
  *addDocument(document) {
    yield document.save();
    const documents = yield this.args.meeting.hasMany('documentVersions').reload();
    documents.pushObject(document);
    yield this.args.meeting.save();
  }

  @task
  *cancelUploadDocuments() {
    const deletePromises = this.newDocuments.map((document) => this.deleteDocument.perform(document));
    yield all(deletePromises);
    this.newDocuments = A();
    this.isOpenDocumentUploadModal = false;
  }

  @task
  *deleteDocument(document) {
    const file = yield document.file;
    yield file.destroyRecord();
    this.newDocuments.removeObject(document);
    const documentContainer = yield document.documentContainer;
    yield documentContainer.destroyRecord();
    yield document.destroyRecord();
  }
}
