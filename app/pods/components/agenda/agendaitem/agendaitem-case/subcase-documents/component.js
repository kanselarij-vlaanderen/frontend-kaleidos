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
  @tracked showDetail = false;
  @tracked isAddingNewDocumentContainer = false;
  @tracked shouldShowLinkedPieces = true;
  @tracked piecesInCreation = A([]); // When creating new documents
  @tracked defaultAccessLevel = null;
  @tracked isLinkingOldPiece = false;
  @tracked piecesToLink = A([]);
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

  // TODO previousPiece is always null in this component
  createNewPiece(uploadedFile, previousPiece, defaults) {
    const propsFromPrevious = [
      'accessLevel',
      'confidential'
    ];
    const newPiece = this.store.createRecord('piece', {});
    propsFromPrevious.forEach(async(key) => {
      newPiece.set(key, previousPiece
        ? await previousPiece.getWithDefault(key, defaults[key])
        : defaults[key]);
    });
    newPiece.set('file', uploadedFile);
    newPiece.set('previousPiece', previousPiece);
    newPiece.set('name', uploadedFile.get('filenameWithoutExtension'));
    return newPiece;
  }

  async deleteAll() {
    await Promise.all(
      this.piecesInCreation.map(async(piece) => {
        const file = await piece.get('file');
        file.destroyRecord();
        const container = piece.get('documentContainer.content');
        container.deleteRecord();
        piece.deleteRecord();
      })
    );
    this.piecesInCreation.clear();
    this.isAddingNewDocumentContainer = false;
  }

  // eslint-disable-next-line class-methods-use-this
  async attachPiecesToModel(pieces, model, propertyName = 'pieces') {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['meeting-record', 'decision'].includes(modelName)) {
      return model;
    }

    const modelPieces = await model.get(propertyName);
    if (modelPieces) {
      model.set(
        propertyName,
        A(Array.prototype.concat(modelPieces.toArray(), pieces.toArray()))
      );
    } else {
      model.set(propertyName, pieces);
    }
    return model;
  }

  async addPiecesToAgendaitems(pieces, agendaitems) {
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        await this.attachPiecesToModel(pieces, agendaitem);
        setNotYetFormallyOk(agendaitem);
        await destroyApprovalsOfAgendaitem(agendaitem);
        return await agendaitem.save();
      })
    );
  }

  async addPiecesToSubcase(pieces, subcase) {
    await this.attachPiecesToModel(pieces, subcase);
    setNotYetFormallyOk(subcase);
    return await subcase.save();
  }

  async addPiecesToAgendaitemOrSubcaseOrMeeting(pieces, agendaitemOrSubcaseOrMeeting) {
    const itemType = agendaitemOrSubcaseOrMeeting.get('constructor.modelName');
    await agendaitemOrSubcaseOrMeeting.hasMany('pieces').reload();
    await this.attachPiecesToModel(pieces, agendaitemOrSubcaseOrMeeting);
    if (itemType === 'subcase' || itemType === 'agendaitem') {
      setNotYetFormallyOk(agendaitemOrSubcaseOrMeeting);
    }
    return await agendaitemOrSubcaseOrMeeting.save();
  }

  async linkPiecesToAgendaitems(pieces, agendaitems) {
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        await this.attachPiecesToModel(pieces, agendaitem, 'linkedPieces');
        return await agendaitem.save();
      })
    );
  }

  async linkPiecesToSubcase(pieces, subcase) {
    await this.attachPiecesToModel(pieces, subcase, 'linkedPieces');
    return await subcase.save();
  }

  @action
  async uploadedFile(uploadedFile) {
    const piecesInCreationLocally = this.piecesInCreation;

    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = await this.store.findRecord('access-level', config.internRegeringAccessLevelId);
    }

    const creationDate = moment().utc()
      .toDate();

    const newPiece = this.createNewPiece(uploadedFile, null, {
      accessLevel: this.defaultAccessLevel,
    });
    newPiece.set('created', creationDate);
    newPiece.set('modified', creationDate);

    const newContainer = await this.store.createRecord('document-container', {
      created: creationDate,
    });
    newPiece.set('documentContainer', newContainer);
    piecesInCreationLocally.push(newPiece);
    this.piecesInCreation = piecesInCreationLocally;
  }

  @action
  async delete(piece) {
    const file = await piece.get('file');
    file.destroyRecord();
    this.piecesInCreation.removeObject(piece);
    const container = piece.get('documentContainer.content');
    container.deleteRecord();
    piece.deleteRecord();
  }

  @action
  async add(file) {
    this.isLoading = false;
    await this.uploadedFile(file);
  }

  @action
  async deleteAllPiecesInCreation() {
    await this.deleteAll();
  }

  @action
  async toggleisAddingNewDocumentContainer() {
    const itemType = this.args.agendaitemOrSubcaseOrMeeting.get('constructor.modelName');
    if (itemType === 'agendaitem' || itemType === 'subcase') {
      await this.args.agendaitemOrSubcaseOrMeeting.preEditOrSaveCheck();
    }
    this.isAddingNewDocumentContainer = !this.isAddingNewDocumentContainer;
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
  chooseDocumentContainerType(piece, type) {
    const documentContainer = piece.get('documentContainer.content');
    documentContainer.type = type;
  }

  @action
  async saveDocumentContainers() {
    this.isLoading = true;
    const pieces = this.piecesInCreation;

    const documentContainers = await Promise.all(
      pieces.map(async(piece) => {
        await piece.save();
        const container = piece.get('documentContainer.content'); // TODO: cannot use .content
        container.set('pieces', A([piece]));
        await container.save();
        return container;
      })
    );

    this.piecesInCreation.clear();
    const agendaActivity = await this.args.agendaitemOrSubcaseOrMeeting.get('agendaActivity'); // when item = agendaitem
    const agendaitemsOnDesignAgenda = await this.args.agendaitemOrSubcaseOrMeeting.get('agendaitemsOnDesignAgendaToEdit'); // when item = subcase

    try {
      const piecesToAttach = [];
      await Promise.all(
        documentContainers.map(async(container) => {
          const pieces = await container.get('pieces');
          pieces.map((piece) => {
            piecesToAttach.push(piece);
          });
        })
      );
      if (piecesToAttach) {
        if (agendaActivity) {
          const subcase = await agendaActivity.get('subcase');
          await this.addPiecesToSubcase(piecesToAttach, subcase);
        } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
          await this.addPiecesToAgendaitems(
            piecesToAttach,
            agendaitemsOnDesignAgenda
          );
        }
        await this.addPiecesToAgendaitemOrSubcaseOrMeeting(piecesToAttach, this.args.agendaitemOrSubcaseOrMeeting);
        await this.args.agendaitemOrSubcaseOrMeeting.save();
      }
    } catch (error) {
      await this.deleteAll();
      throw error;
    } finally {
      this.isLoading = false;
      this.isAddingNewDocumentContainer = false;
    }
  }

  @action
  toggleisLinkingOldPiece() {
    this.isLinkingOldPiece = !this.isLinkingOldPiece;
  }

  @action
  link(piece) {
    this.piecesToLink.addObject(piece);
  }

  @action
  unlink(piece) {
    this.piecesToLink.removeObject(piece);
  }

  @action
  async linkPieces() {
    const pieces = this.piecesToLink;
    const agendaActivity = this.args.agendaitemOrSubcaseOrMeeting.get('agendaActivity'); // when item = agendaitem
    const agendaitemsOnDesignAgenda = this.args.agendaitemOrSubcaseOrMeeting.get('agendaitemsOnDesignAgendaToEdit'); // when item = subcase
    try {
      const piecesToAttach = [];
      await Promise.all(
        pieces.map(async(piece) => {
          const documentContainer = await piece.get('documentContainer');
          const piecesFromContainer = await documentContainer.get('pieces');
          piecesFromContainer.map((piece) => {
            piecesToAttach.push(piece);
          });
        })
      );
      if (agendaActivity) {
        const subcase = await agendaActivity.get('subcase');
        await this.linkPiecesToSubcase(piecesToAttach, subcase);
      } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
        await this.linkPiecesToAgendaitems(piecesToAttach, agendaitemsOnDesignAgenda);
      }
      await this.attachPiecesToModel(piecesToAttach, this.args.agendaitemOrSubcaseOrMeeting, 'linkedPieces');
      await this.args.agendaitemOrSubcaseOrMeeting.save();
    } finally {
      this.isLinkingOldPiece = false;
      this.piecesToLink = A([]);
    }
  }
}

