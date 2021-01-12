import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import VRDocumentName from 'fe-redpencil/utils/vr-document-name';
import config from 'fe-redpencil/utils/config';
import { restorePiecesFromPreviousAgendaitem } from 'fe-redpencil/utils/documents';

export default class DocumentLink extends Component {
  @service store;
  @service currentSession;
  @service fileService;
  @service toaster;
  @service intl;

  @tracked isExpandedVersionHistory = false;
  @tracked isOpenUploadModal = false;
  @tracked isOpenVerifyDeleteModal = false;
  @tracked isEditingPiece = false;

  @tracked uploadedFile;
  @tracked newPiece;
  @tracked pieceNameBuffer;
  @tracked defaultAccessLevel;
  @tracked sortedPieces = [];

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

    // TODO remove yield once consuming component doesn't pass Proxy as @documentContainer
    const documentContainer = yield this.args.documentContainer;
    const containerPieces = yield documentContainer.sortedPieces;
    if (this.args.lastPiece) {
      const idx = containerPieces.indexOf(this.args.lastPiece);
      this.sortedPieces = A(containerPieces.slice(0, idx + 1));
    } else {
      this.sortedPieces = A(containerPieces);
    }
  }

  get lastPiece() {
    return this.sortedPieces.length && this.sortedPieces.lastObject;
  }

  get reverseSortedPieces() {
    return this.sortedPieces.slice(0).reverse();
  }

  get itemType() {
    return this.args.agendaitemOrSubcase && this.args.agendaitemOrSubcase.constructor.modelName;
  }

  @action
  async openUploadModal() {
    if (this.itemType === 'agendaitem' || this.itemType === 'subcase') {
      await this.args.agendaitemOrSubcase.preEditOrSaveCheck();
    }
    this.isOpenUploadModal = true;
  }

  @task
  *uploadPiece(file) {
    // ensure we're working on the most recent state of the document container
    const documentContainer = yield this.args.documentContainer.reload();
    const containerPieces = yield documentContainer.hasMany('pieces').reload();

    const previousPiece = yield documentContainer.lastPiece;
    const previousAccessLevel = yield previousPiece.accessLevel;
    const now = moment().utc()
      .toDate();
    this.newPiece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      previousPiece: previousPiece,
      confidential: previousPiece.confidential,
      accessLevel: previousAccessLevel || this.defaultAccessLevel,
      documentContainer: documentContainer,
    });
    containerPieces.pushObject(this.newPiece);
    const pieceName = new VRDocumentName(previousPiece.name).withOtherVersionSuffix(containerPieces.length);
    this.newPiece.set('name', pieceName);
  }

  @task
  *addPiece() {
    try {
      yield this.args.onAddPiece(this.newPiece);
      this.loadData.perform();
      this.newPiece = null;
      this.isOpenUploadModal = false;
    } catch (error) {
      yield this.deleteUploadedPiece.perform();
      this.isOpenUploadModal = false;
      throw error;
    }
  }

  @task
  *deleteUploadedPiece() {
    if (this.newPiece) {
      yield this.fileService.deletePiece(this.newPiece);
      this.newPiece = null;
    }
  }

  @task
  *cancelUploadPiece() {
    yield this.deleteUploadedPiece.perform();
    this.isOpenUploadModal = false;
  }

  @action
  enableEditPieceName() {
    if (this.currentSession.isEditor) {
      this.pieceNameBuffer = this.lastPiece.name;
      this.isEditingPiece = true;
    }
  }

  @action
  cancelEditPieceName() {
    this.isEditingPiece = false;
    this.pieceNameBuffer = null;
  }

  @task
  *savePieceName() {
    const now = moment().toDate();
    this.lastPiece.set('modified', now);
    this.lastPiece.set('name', this.pieceNameBuffer);
    yield this.lastPiece.save();
    this.isEditingPiece = false;
    this.pieceNameBuffer = null;
  }

  @action
  toggleVersionHistory() {
    this.isExpandedVersionHistory = !this.isExpandedVersionHistory;
  }

  @action
  deleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = true;
  }

  @action
  cancelDeleteDocumentContainer() {
    this.isOpenVerifyDeleteModal = false;
  }

  @action
  verifyDeleteDocumentContainer() {
    const verificationToast = {
      type: 'revert-action',
      title: this.intl.t('warning-title'),
      message: this.intl.t('document-being-deleted'),
      options: {
        timeOut: 15000,
      },
    };
    verificationToast.options.onUndo = () => {
      this.fileService.reverseDelete(this.args.documentContainer.get('id'));
      this.toaster.toasts.removeObject(verificationToast);
    };
    this.toaster.displayToast.perform(verificationToast);
    this.deleteDocumentContainerWithUndo.perform();
    this.isOpenVerifyDeleteModal = false;
  }

  @task
  *deleteDocumentContainerWithUndo() {
    // TODO remove yield once consuming component doesn't pass Proxy as @documentContainer
    const documentContainer = yield this.args.documentContainer;
    yield this.fileService.deleteDocumentContainerWithUndo.perform(documentContainer);
  }

  @action
  async setPreviousPiecesFromAgendaitem(documentContainer) {
    if (documentContainer) {
      const lastPiece = await documentContainer.get('lastPiece');
      if (this.args.agendaitemOrSubcase && lastPiece) {
        if (this.itemType === 'agendaitem') {
          await restorePiecesFromPreviousAgendaitem(this.args.agendaitemOrSubcase, documentContainer);
        }
        if (this.itemType === 'subcase') {
          const latestActivity = await this.args.agendaitemOrSubcase.get('latestActivity');
          if (latestActivity) {
            const latestAgendaitem = await latestActivity.get('latestAgendaitem');
            await restorePiecesFromPreviousAgendaitem(latestAgendaitem, documentContainer);
            await latestAgendaitem.hasMany('pieces').reload();
          }
        }
        await this.args.agendaitemOrSubcase.hasMany('pieces').reload();
      }
    }
  }
}
