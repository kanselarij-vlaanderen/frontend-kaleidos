import Component from '@glimmer/component';
import { action } from '@ember/object';
import moment from 'moment';
import { inject as service } from '@ember/service';
import config from 'frontend-kaleidos/utils/config';
import VRDocumentName from 'frontend-kaleidos/utils/vr-document-name';
import { tracked } from '@glimmer/tracking';

export default class ReportLink extends Component {
  @service toaster;
  @service fileService;
  @service intl;
  @service currentSession;
  @service store;

  @tracked isShowingPieces = false;
  @tracked isUploadingNewPiece = false;
  @tracked isEditing = false;
  @tracked defaultAccessLevel = null;
  @tracked pieceInCreation = null;
  @tracked uploadedFile = null;
  @tracked nameBuffer = '';
  @tracked isVerifyingDelete = false;
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
      this.pieceInCreation = null;
      if (pieceInCreation) {
        await this.fileService.deletePiece(pieceInCreation);
      } else {
        await this.fileService.deleteFile(this.uploadedFile);
      }

      if (!this.isDestroyed) {
        this.uploadedFile = null;
      }
      await this.args.treatment.belongsTo('report').reload();
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
    await this.fileService.get('deleteDocumentContainerWithUndo').perform(this.documentContainerToDelete);
  }

  // eslint-disable-next-line class-methods-use-this
  async attachPieceToTreatment(piece, treatment) {
    const report = await treatment.get('report');
    if (report) {
      treatment.set('report', piece);
      await treatment.save();
    }
    return treatment;
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
    if (await this.args.documentContainer) {
      await this.args.documentContainer.reload();
    }
    await this.args.documentContainer.hasMany('pieces').reload();
    if (!this.defaultAccessLevel) {
      this.defaultAccessLevel = await this.store.findRecord('access-level', config.internRegeringAccessLevelId);
    }

    const containerPieces = await this.args.documentContainer.get('pieces');
    const sortedContainerPieces = containerPieces.sortBy('created');
    const previousPiece = sortedContainerPieces.get('lastObject');
    const newPiece = this.createNewPiece(uploadedFile, previousPiece, {
      accessLevel: this.defaultAccessLevel,
    });
    newPiece.set('created', creationDate);
    newPiece.set('modified', creationDate);
    containerPieces.pushObject(newPiece);
    newPiece.set('documentContainer', this.args.documentContainer); // Explicitly set relation both ways
    const newName = new VRDocumentName(previousPiece.get('name')).withOtherVersionSuffix(containerPieces.length);
    newPiece.set('name', newName);
    this.args.documentContainer.notifyPropertyChange('pieces');// Why exactly? Ember should handle this?
    this.pieceInCreation = await newPiece;
  }

  @action
  showPieces() {
    this.isShowingPieces = !this.isShowingPieces;
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
    this.nameBuffer = this.args.treatment.report.get('name');
    this.isEditing = true;
  }

  @action
  async cancelEditingName() {
    const report = await this.args.treatment.get('report');
    report.rollbackAttributes();
    this.isEditing = false;
  }

  @action
  async saveNameChange() {
    const report = await this.args.treatment.get('report');
    report.set('modified', moment().toDate());
    report.set('name', this.nameBuffer);
    await report.save();
    if (!this.isDestroyed) {
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
    this.isUploadingNewPiece = true;
  }

  @action
  async cancelUploadPiece() {
    if (this.uploadedFile) {
      const previousPiece = await this.pieceInCreation.get('previousPiece');
      previousPiece.rollbackAttributes();
      const pieceInCreation = await this.uploadedFile.get('piece');
      if (pieceInCreation) {
        await this.fileService.deletePiece(pieceInCreation);
      } else {
        await this.fileService.deleteFile(this.uploadedFile);
      }
      this.uploadedFile = null;
      this.pieceInCreation = null;
    }
    this.isUploadingNewPiece = false;
  }

  @action
  async savePiece() {
    this.isLoading = true;
    const piece = this.pieceInCreation;
    await piece.save();
    try {
      await this.attachPieceToTreatment(piece, this.args.treatment);
    } catch (error) {
      await this.deleteUploadedPiece();
      throw error;
    } finally {
      if (!this.isDestroyed) {
        this.uploadedFile = null;
        this.isLoading = false;
        this.isUploadingNewPiece = false;
        this.pieceInCreation = null;
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

  @action
  async setPreviousPiece(documentContainer) {
    if (documentContainer) {
      const containerPieces = await documentContainer.get('pieces');
      if (containerPieces) {
        const sortedContainerPieces = containerPieces.sortBy('created');
        const previousPiece = sortedContainerPieces.get('lastObject');
        if (previousPiece) {
          this.args.treatment.set('report', previousPiece);
          await this.args.treatment.save();
        }
      }
    }
  }
}
