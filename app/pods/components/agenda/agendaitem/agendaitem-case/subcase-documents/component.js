import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agendaitem-utils';

import moment from 'moment';
import config from 'fe-redpencil/utils/config';

import { tracked } from '@glimmer/tracking';

export default class SubcaseDocuments extends Component {
  @service currentSession;
  @service store;
  @tracked isEditing = false;
  @tracked isLoading = false;
  @tracked isAddingNewDocument = false;
  @tracked shouldShowLinkedDocuments = true;
  @tracked documentsInCreation = A([]); // When creating new documents
  @tracked defaultAccessLevel = null;
  @tracked isLinkingOldDocument = false;
  @tracked documentsToLink = A([]);
  @tracked documentTypes = null;

  documentContainer = null;

  constructor() {
    super(...arguments);
    this.store.query('document-type', {
      sort: 'priority', 'page[size]': 50,
    }).then((types) => {
      this.documentTypes = types;
    });
  }

  get governmentCanViewDocuments() {
    const isAgendaitem = this.args.agendaitemOrSubcaseOrMeeting.get('modelName') === 'agendaitem';
    const isSubcase = this.args.agendaitemOrSubcaseOrMeeting.get('modelName') === 'subcase';
    const isOverheid = this.currentSession.isOverheid;

    if (isAgendaitem) {
      const documentsAreReleased = this.args.agendaitemOrSubcaseOrMeeting.get('agenda.createdFor.releasedDocuments');
      return !(isOverheid && !documentsAreReleased);
    }

    if (isSubcase) {
      const documentsAreReleased = this.args.agendaitemOrSubcaseOrMeeting.get('requestedForMeeting.releasedDocuments');
      return !(isOverheid && !documentsAreReleased);
    }

    return true;
  }

  createNewDocument(uploadedFile, previousDocument, defaults) {
    const propsFromPrevious = [
      'accessLevel',
      'confidential'
    ];
    const newDocument = this.store.createRecord('document-version', {});
    propsFromPrevious.forEach(async(key) => {
      newDocument.set(key, previousDocument
        ? await previousDocument.getWithDefault(key, defaults[key])
        : defaults[key]);
    });
    newDocument.set('file', uploadedFile);
    newDocument.set('previousVersion', previousDocument);
    newDocument.set('name', uploadedFile.get('filenameWithoutExtension'));
    return newDocument;
  }

  async deleteAll() {
    await Promise.all(
      this.documentsInCreation.map(async(doc) => {
        const file = await doc.get('file');
        file.destroyRecord();
        const container = doc.get('documentContainer.content');
        container.deleteRecord();
        doc.deleteRecord();
      })
    );
    this.documentsInCreation.clear();
    this.isAddingNewDocument = false;
  }

  // TODO propertyName = documents when all models have this relation
  // eslint-disable-next-line class-methods-use-this
  async attachDocumentsToModel(documents, model, propertyName = 'documentVersions') {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['decision'].includes(modelName)) {
      return model;
    }

    const modelDocuments = await model.get(propertyName);
    if (modelDocuments) {
      model.set(
        propertyName,
        A(Array.prototype.concat(modelDocuments.toArray(), documents.toArray()))
      );
    } else {
      model.set(propertyName, documents);
    }
    return model;
  }

  async addDocumentsToAgendaitems(documents, agendaitems) {
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        await this.attachDocumentsToModel(documents, agendaitem);
        setNotYetFormallyOk(agendaitem);
        await destroyApprovalsOfAgendaitem(agendaitem);
        return await agendaitem.save();
      })
    );
  }

  async addDocumentsToSubcase(documents, subcase) {
    await this.attachDocumentsToModel(documents, subcase);
    setNotYetFormallyOk(subcase);
    return await subcase.save();
  }

  async addDocumentToAgendaitemOrSubcaseOrMeeting(documents, agendaitemOrSubcaseOrMeeting) {
    const itemType = agendaitemOrSubcaseOrMeeting.get('constructor.modelName');
    await agendaitemOrSubcaseOrMeeting.hasMany('documentVersions').reload();
    await this.attachDocumentsToModel(documents, agendaitemOrSubcaseOrMeeting);
    if (itemType === 'subcase' || itemType === 'agendaitem') {
      setNotYetFormallyOk(agendaitemOrSubcaseOrMeeting);
    }
    return await agendaitemOrSubcaseOrMeeting.save();
  }

  async linkDocumentsToAgendaitems(documents, agendaitems) {
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        await this.attachDocumentsToModel(documents, agendaitem, 'linkedDocumentVersions');
        return await agendaitem.save();
      })
    );
  }

  async linkDocumentsToSubcase(documents, subcase) {
    await this.attachDocumentsToModel(documents, subcase, 'linkedDocumentVersions');
    return await subcase.save();
  }

  @action
  async uploadedFile(uploadedFile) {
    const documentsInCreationLocally = this.documentsInCreation;

    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = await this.store.findRecord('access-level', config.internRegeringAccessLevelId);
    }

    const creationDate = moment().utc()
      .toDate();

    const newDocument = this.createNewDocument(uploadedFile, null, {
      accessLevel: this.defaultAccessLevel,
    });
    newDocument.set('created', creationDate);
    newDocument.set('modified', creationDate);

    const newContainer = this.store.createRecord('document', {
      created: creationDate,
    });
    newDocument.set('documentContainer', newContainer);
    await documentsInCreationLocally.push(newDocument);
    this.documentsInCreation = documentsInCreationLocally;
  }

  @action
  async delete(doc) {
    const file = await doc.get('file');
    file.destroyRecord();
    this.documentsInCreation.removeObject(doc);
    const container = doc.get('documentContainer.content');
    container.deleteRecord();
    doc.deleteRecord();
  }

  @action
  async add(file) {
    this.isLoading = false;
    await this.uploadedFile(file);
  }

  @action
  async deleteAllDocuments() {
    await this.deleteAll();
  }

  @action
  async toggleIsAddingNewDocument() {
    const itemType = this.args.agendaitemOrSubcaseOrMeeting.get('constructor.modelName');
    if (itemType === 'agendaitem' || itemType === 'subcase') {
      await this.args.agendaitemOrSubcaseOrMeeting.preEditOrSaveCheck();
    }
    this.isAddingNewDocument = !this.isAddingNewDocument;
  }

  @action
  async toggleIsEditing() {
    const itemType = this.args.agendaitemOrSubcaseOrMeeting.get('constructor.modelName');
    if (itemType === 'agendaitem' || itemType === 'subcase') {
      await this.args.agendaitemOrSubcaseOrMeeting.preEditOrSaveCheck();
    }
    this.isEditing = !this.isEditing;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  @action
  // eslint-disable-next-line class-methods-use-this
  chooseDocumentContainerType(document, type) {
    const documentContainer = document.get('documentContainer.content');
    documentContainer.type = type;
  }

  @action
  async saveDocumentContainers() {
    this.isLoading = true;
    const docs = this.documentsInCreation;

    const documentContainers = await Promise.all(
      docs.map(async(doc) => {
        await doc.save();
        const container = doc.get('documentContainer.content'); // TODO: cannot use .content
        container.set('documents', A([doc]));
        await container.save();
        return container;
      })
    );

    this.documentsInCreation.clear();
    const agendaActivity = await this.args.agendaitemOrSubcaseOrMeeting.get('agendaActivity'); // when item = agendaitem
    const agendaitemsOnDesignAgenda = await this.args.agendaitemOrSubcaseOrMeeting.get('agendaitemsOnDesignAgendaToEdit'); // when item = subcase

    try {
      const documentsToAttach = [];
      await Promise.all(
        documentContainers.map(async(container) => {
          const documents = await container.get('documentVersions');
          documents.map((document) => {
            documentsToAttach.push(document);
          });
        })
      );
      if (documentsToAttach) {
        if (agendaActivity) {
          const subcase = await agendaActivity.get('subcase');
          await this.addDocumentsToSubcase(documentsToAttach, subcase);
        } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
          await this.addDocumentsToAgendaitems(
            documentsToAttach,
            agendaitemsOnDesignAgenda
          );
        }
        await this.addDocumentToAgendaitemOrSubcaseOrMeeting(documentsToAttach, this.args.agendaitemOrSubcaseOrMeeting);
        await this.args.agendaitemOrSubcaseOrMeeting.save();
      }
    } catch (error) {
      await this.deleteAll();
      throw error;
    } finally {
      this.isLoading = false;
      this.isAddingNewDocument = false;
    }
  }

  @action
  toggleIsLinkingOldDocument() {
    this.isLinkingOldDocument = !this.isLinkingOldDocument;
  }

  @action
  link(document) {
    this.documentsToLink.addObject(document);
  }

  @action
  unlink(document) {
    this.documentsToLink.removeObject(document);
  }

  @action
  async linkDocuments() {
    const documents = this.documentsToLink;
    const agendaActivity = this.args.agendaitemOrSubcaseOrMeeting.get('agendaActivity'); // when item = agendaitem
    const agendaitemsOnDesignAgenda = this.args.agendaitemOrSubcaseOrMeeting.get('agendaitemsOnDesignAgendaToEdit'); // when item = subcase
    try {
      const documentsToAttach = [];
      await Promise.all(
        documents.map(async(document) => {
          const documentContainer = await document.get('documentContainer');
          const documentVersionsFromContainer = await documentContainer.get('documentVersions');
          documentVersionsFromContainer.map((doc) => {
            documentsToAttach.push(doc);
          });
        })
      );
      if (agendaActivity) {
        const subcase = await agendaActivity.get('subcase');
        await this.linkDocumentsToSubcase(documentsToAttach, subcase);
      } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
        await this.linkDocumentsToAgendaitems(documentsToAttach, agendaitemsOnDesignAgenda);
      }
      await this.attachDocumentsToModel(documentsToAttach, this.args.agendaitemOrSubcaseOrMeeting, 'linkedDocumentVersions');
      await this.args.agendaitemOrSubcaseOrMeeting.save();
    } finally {
      this.isLinkingOldDocument = false;
      this.documentsToLink = A([]);
    }
  }
}

