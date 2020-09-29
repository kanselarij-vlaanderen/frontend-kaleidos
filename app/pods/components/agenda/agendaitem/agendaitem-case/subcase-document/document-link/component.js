import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agendaitem-utils';
import config from 'fe-redpencil/utils/config';
import { A } from '@ember/array';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';
import { tracked } from '@glimmer/tracking';

export default class DocumentLink extends Component {
  @service toaster;
  @service fileService;
  @service intl;
  @service currentSession;
  @service store;

  @tracked isShowingPieces = false;
  @tracked reverseSortedPieces = A([]);
  @tracked isUploadingNewPiece = false;
  @tracked isEditing = false;
  @tracked defaultAccessLevel = null;
  @tracked pieceInCreation = null;
  @tracked uploadedFile = null;
  @tracked nameBuffer = '';
  @tracked isVerifyingDelete = false;
  @tracked mySortedPieces;
  @tracked lastPiece = null;
  @tracked documentTypes = null;

  classNameBindings = ['aboutToDelete'];
  documentContainerToDelete = null;

  constructor() {
    super(...arguments);
    this.store.query('document-type', {
      sort: 'priority', 'page[size]': 50,
    }).then((types) => {
      this.documentTypes = types;
    });
  }

  async deleteUploadedPiece() {
    if (this.uploadedFile && this.uploadedFile.id) {
      const pieceInCreation = await this.uploadedFile.piece;
      if (pieceInCreation) {
        await this.fileService.deletePiece(pieceInCreation);
      } else {
        await this.fileService.deleteFile(this.uploadedFile);
      }

      if (!this.isDestroyed) {
        this.uploadedFile = null;
      }
    }
  }

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

  async deleteDocumentContainerWithUndo() {
    const pieces = this.args.subcaseAgendaitemMeetingOrDocumentContainer.pieces;
    const itemType = this.args.subcaseAgendaitemMeetingOrDocumentContainer.constructor.modelName;
    if (itemType === 'document-container') {
      await this.fileService.get('deleteDocumentContainerWithUndo').perform(this.documentContainerToDelete);
    } else {
      await this.fileService.get('deleteDocumentContainerWithUndo').perform(this.documentContainerToDelete)
        .then(() => {
          if (!this.args.subcaseAgendaitemMeetingOrDocumentContainer.aboutToDelete && pieces) {
            this.args.subcaseAgendaitemMeetingOrDocumentContainer.hasMany('pieces').reload();
          }
        });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async attachPiecesToModel(pieces, model, propertyName = 'pieces') {
    const modelName = await model.get('constructor.modelName');
    // Don't do anything for these models
    if (['meeting-record', 'agenda-item-treatment'].includes(modelName)) {
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

  async addPieceToAgendaitems(pieces, agendaitems) {
    return Promise.all(
      agendaitems.map(async(agendaitem) => {
        await agendaitem.hasMany('pieces').reload();
        await this.attachPiecesToModel(pieces, agendaitem);
        setNotYetFormallyOk(agendaitem);
        await destroyApprovalsOfAgendaitem(agendaitem);
        return await agendaitem.save();
      })
    );
  }

  async addPieceToSubcase(pieces, subcase) {
    await subcase.hasMany('pieces').reload();
    await this.attachPiecesToModel(pieces, subcase);
    return await subcase.save();
  }

  async addPieceToAnyModel(pieces, subcaseAgendaitemMeetingOrDocumentContainer) {
    const itemType = subcaseAgendaitemMeetingOrDocumentContainer.get('constructor.modelName');
    if (itemType === 'document-container') {
      // The document-container is already saved in this case
      return;
    }
    await subcaseAgendaitemMeetingOrDocumentContainer.hasMany('pieces').reload();
    await this.attachPiecesToModel(pieces, subcaseAgendaitemMeetingOrDocumentContainer);
    if (itemType === 'subcase' || itemType === 'agendaitem') {
      setNotYetFormallyOk(subcaseAgendaitemMeetingOrDocumentContainer);
    }
    return await subcaseAgendaitemMeetingOrDocumentContainer.save();
  }

  get setupPieces() {
    return this.setupMySortedPieces();
  }

  setupMySortedPieces() {
    const itemPieceIds = {};
    if (!this.args.subcaseAgendaitemMeetingOrDocumentContainer || !this.args.documentContainer) {
      return false;
    }
    const subcaseAgendaitemMeetingOrDocumentContainerPieces = this.args.subcaseAgendaitemMeetingOrDocumentContainer.pieces;
    if (subcaseAgendaitemMeetingOrDocumentContainerPieces) {
      subcaseAgendaitemMeetingOrDocumentContainerPieces.map((myPiece) => {
        itemPieceIds[myPiece.get('id')] = true;
      });
    }
    const containerPieces = this.args.documentContainer.sortedPieces;
    if (containerPieces) {
      this.mySortedPieces = containerPieces.filter((piece) => itemPieceIds[piece.id]);
      if (this.mySortedPieces) {
        this.lastPiece = this.mySortedPieces.lastObject;
      }
    }
    return true;
  }

  async getReverseSortedPieces() {
    const reversed = [];
    if (this.mySortedPieces) {
      this.mySortedPieces.map((mySortedPiece) => {
        reversed.push(mySortedPiece);
      });
      reversed.reverse();
      this.reverseSortedPieces = reversed;
    }
  }

  get openClass() {
    if (this.isShowingPieces) {
      return 'js-vl-accordion--open';
    }
    return null;
  }

  @action
  async uploadFile(uploadedFile) {
    const creationDate = moment().utc()
      .toDate();
    await this.args.documentContainer.reload();
    await this.args.documentContainer.hasMany('pieces').reload();
    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = await this.store.findRecord('access-level', config.internRegeringAccessLevelId);
    }

    const previousPiece = this.args.documentContainer ? (await this.args.documentContainer.get('lastPiece')) : null;
    const newPiece = this.createNewPiece(uploadedFile, previousPiece, {
      accessLevel: this.defaultAccessLevel,
    });
    newPiece.set('created', creationDate);
    newPiece.set('modified', creationDate);
    const pieces = await this.args.documentContainer.get('pieces');
    pieces.pushObject(newPiece);
    newPiece.set('documentContainer', this.args.documentContainer); // Explicitly set relation both ways
    const newName = new VRDocumentName(previousPiece.get('name')).withOtherPieceSuffix(pieces.length);
    newPiece.set('name', newName);
    this.args.documentContainer.notifyPropertyChange('pieces');// Why exactly? Ember should handle this?
    this.pieceInCreation = await newPiece;
  }

  @action
  showPieces() {
    this.isShowingPieces = !this.isShowingPieces;
    if (this.isShowingPieces) {
      this.getReverseSortedPieces();
    }
  }

  @action
  async delete() {
    await this.deleteUploadedPiece();
  }

  @action
  startEditingName() {
    if (!this.currentSession.isEditor) {
      return;
    }
    this.nameBuffer = this.lastPiece.name;
    this.isEditing = true;
  }

  @action
  cancelEditingName() {
    this.args.documentContainer.rollbackAttributes();
    this.isEditing = false;
  }

  @action
  async saveNameChange(piece) {
    piece.set('modified', moment().toDate());
    piece.set('name', this.nameBuffer);
    await piece.save();
    if (!this.isDestroyed) {
      /*
       * Due to over-eager computed properties, this components gets destroyed after a namechange,
       * which eliminates the need for changing this flag (Changing properties of destroyed components causes exceptions).
       * This should get fixed in the future though.
       */
      this.isEditing = false;
    }
  }

  @action
  async add(file) {
    this.uploadedFile = file;
    await this.uploadFile(file);
  }

  @action
  async openUploadDialog() {
    const itemType = this.args.subcaseAgendaitemMeetingOrDocumentContainer.constructor.modelName;
    if (itemType === 'agendaitem' || itemType === 'subcase') {
      await this.args.subcaseAgendaitemMeetingOrDocumentContainer.preEditOrSaveCheck();
    }
    this.isUploadingNewPiece = true;
  }

  @action
  async cancelUploadPiece() {
    if (this.uploadedFile) {
      const piece = await this.args.documentContainer.lastPiece;
      piece.rollbackAttributes();
      const pieceInCreation = await this.uploadedFile.get('piece');
      if (pieceInCreation) {
        await this.fileService.deletePiece(pieceInCreation);
      } else {
        await this.fileService.deleteFile(this.uploadedFile);
      }
      this.uploadedFile = null;
    }
    this.isUploadingNewPiece = false;
  }

  @action
  async savePiece() {
    // TODO this component/method is used for agendaitem, subcase, session (AND for decision/meetingRecord but we pass in document-container model)
    // TODO should we seperate this logic to make the addition of a piece more generic ?
    this.isLoading = true;
    const piece = await this.args.documentContainer.lastPiece;
    await piece.save();
    const agendaActivity = await this.args.subcaseAgendaitemMeetingOrDocumentContainer.agendaActivity; // when item = agendaitem
    const agendaitemsOnDesignAgenda = await this.args.subcaseAgendaitemMeetingOrDocumentContainer.agendaitemsOnDesignAgendaToEdit; // when item = subcase
    try {
      if (agendaActivity) {
        const subcase = await agendaActivity.get('subcase');
        await this.addPieceToSubcase([piece], subcase);
      } else if (agendaitemsOnDesignAgenda && agendaitemsOnDesignAgenda.length > 0) {
        await this.addPieceToAgendaitems([piece], agendaitemsOnDesignAgenda);
      }
      await this.addPieceToAnyModel([piece], this.args.subcaseAgendaitemMeetingOrDocumentContainer);
    } catch (error) {
      await this.deleteUploadedPiece();
      throw error;
    } finally {
      if (!this.isDestroyed) {
        this.uploadedFile = null;
        this.isLoading = false;
        this.isUploadingNewPiece = false;
      }
    }
  }

  @action
  cancel() {
    this.documentContainerToDelete = null;
    this.isVerifyingDelete = false;
  }

  @action
  verify() {
    const verificationToast = {
      type: 'revert-action',
      title: this.intl.t('warning-title'),
      message: this.intl.t('document-being-deleted'),
      options: {
        timeOut: 15000,
      },
    };
    verificationToast.options.onUndo = () => {
      this.fileService.reverseDelete(this.documentContainerToDelete.get('id'));
      this.toaster.toasts.removeObject(verificationToast);
    };
    this.toaster.displayToast.perform(verificationToast);
    this.deleteDocumentContainerWithUndo();
    this.isVerifyingDelete = false;
  }

  @action
  deleteDocumentContainer(documentContainer) {
    this.documentContainerToDelete = documentContainer;
    this.isVerifyingDelete = true;
  }
}
