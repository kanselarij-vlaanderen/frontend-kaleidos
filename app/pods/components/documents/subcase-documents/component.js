import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { all } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import moment from 'moment';
import config from 'fe-redpencil/utils/config';
import {
  destroyApprovalsOfAgendaitem, setNotYetFormallyOk
} from 'fe-redpencil/utils/agendaitem-utils';
import { addPieceToAgendaitem } from 'fe-redpencil/utils/documents';

export default class SubcaseDocuments extends Component {
  @service currentSession;
  @service store;

  @tracked isEnabledPieceEdit = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked isOpenLinkedPieceModal = false;
  @tracked defaultAccessLevel;
  @tracked pieces = A([]);
  @tracked linkedPieces = A([]);
  @tracked newPieces = A([]);
  @tracked newLinkedPieces = A([]);

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

    // TODO change to store.query to have control over the page size
    this.pieces = yield this.args.agendaitemOrSubcase.pieces;
    this.linkedPieces = yield this.args.agendaitemOrSubcase.linkedPieces;
  }

  get itemType() {
    return this.args.agendaitemOrSubcase && this.args.agendaitemOrSubcase.constructor.modelName;
  }

  get governmentCanViewDocuments() {
    const isAgendaitem = this.itemType === 'agendaitem';
    const isSubcase = this.itemType === 'subcase';
    const isOverheid = this.currentSession.isOverheid;

    if (isAgendaitem) {
      const documentsAreReleased = this.args.agendaitemOrSubcase.get('agenda.createdFor.releasedDocuments');
      return !(isOverheid && !documentsAreReleased);
    }

    if (isSubcase) {
      const documentsAreReleased = this.args.agendaitemOrSubcase.get('requestedForMeeting.releasedDocuments');
      return !(isOverheid && !documentsAreReleased);
    }

    return true;
  }

  @action
  async enablePieceEdit() {
    await this.args.agendaitemOrSubcase.preEditOrSaveCheck();
    this.isEnabledPieceEdit = true;
  }

  @action
  disablePieceEdit() {
    this.isEnabledPieceEdit = false;
  }

  @action
  async openPieceUploadModal() {
    await this.args.agendaitemOrSubcase.preEditOrSaveCheck();
    this.isOpenPieceUploadModal = true;
  }

  @action
  uploadPiece(file) {
    const now = moment().utc()
      .toDate();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      confidential: false,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newPieces.pushObject(piece);
  }

  @task
  *savePieces() {
    const savePromises = this.newPieces.map(async(piece) => {
      try {
        await this.savePiece.perform(piece);
      } catch (error) {
        await this.deletePiece.perform(piece);
        throw error;
      }
    });
    yield all(savePromises);
    yield this.updateRelatedAgendaitemsAndSubcase.perform(this.newPieces);
    this.isOpenPieceUploadModal = false;
    this.newPieces = A();
  }

  /**
   * Save a new document container and the piece it wraps
  */
  @task
  *savePiece(piece) {
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.save();
    yield piece.save();
  }

  /**
   * Add new piece to an existing document container
  */
  @task
  *addPiece(piece) {
    yield piece.save();
    yield this.updateRelatedAgendaitemsAndSubcase.perform([piece]);
  }

  @task
  *updateRelatedAgendaitemsAndSubcase(pieces) {
    if (this.itemType === 'agendaitem') {
      // Link pieces to subcase related to the agendaitem
      const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
      if (agendaActivity) {
        const subcase = yield agendaActivity.subcase;
        const currentSubcasePieces = yield subcase.hasMany('pieces').reload();
        const subcasePieces = currentSubcasePieces.pushObjects(pieces);
        subcase.set('pieces', subcasePieces);
        yield subcase.save();

        // Link piece to agendaitem
        setNotYetFormallyOk(this.args.agendaitemOrSubcase);
        yield this.args.agendaitemOrSubcase.save();
        for (const piece of pieces) {
          yield addPieceToAgendaitem(this.args.agendaitemOrSubcase, piece);
        }

        this.pieces = yield this.args.agendaitemOrSubcase.hasMany('pieces').reload();
      }
    } else if (this.itemType === 'subcase') {
      // Link piece to all agendaitems that are related to the subcase via an agendaActivity
      // and related to an agenda in the design status
      const agendaitems = yield this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
        'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
      });
      const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
        for (const piece of pieces) {
          await addPieceToAgendaitem(agendaitem, piece);
        }
        await agendaitem.hasMany('pieces').reload();
        setNotYetFormallyOk(agendaitem);
        await destroyApprovalsOfAgendaitem(agendaitem);
        await agendaitem.save();
      });
      yield all(agendaitemUpdates);

      // Link piece to subcase
      const currentSubcasePieces = yield this.args.agendaitemOrSubcase.hasMany('pieces').reload();
      const subcasePieces = currentSubcasePieces.pushObjects(pieces);
      this.args.agendaitemOrSubcase.set('pieces', subcasePieces);
      yield this.args.agendaitemOrSubcase.save();

      this.pieces = subcasePieces;
    }
  }

  @task
  *cancelUploadPieces() {
    const deletePromises = this.newPieces.map((piece) => this.deletePiece.perform(piece));
    yield all(deletePromises);
    this.newPieces = A();
    this.isOpenPieceUploadModal = false;
  }

  @task
  *deletePiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @action
  openLinkedPieceModal() {
    this.isOpenLinkedPieceModal = true;
  }

  @action
  cancelLinkPieces() {
    this.newLinkedPieces = A([]);
    this.isOpenLinkedPieceModal = false;
  }

  @action
  linkPiece(piece) {
    this.newLinkedPieces.pushObject(piece);
  }

  @action
  unlinkPiece(piece) {
    this.newLinkedPieces.removeObject(piece);
  }

  @task
  *saveLinkedPieces() {
    let allPiecesToLink = [];
    for (const linkedPiece of this.newLinkedPieces) {
      const linkedPieces = yield this.store.query('piece', {
        'filter[document-container][pieces][:id:]': linkedPiece.get('id'),
        page: {
          size: 300,
        },
      });
      allPiecesToLink = [...allPiecesToLink, ...linkedPieces.toArray()];
    }

    if (allPiecesToLink.length) {
      if (this.itemType === 'agendaitem') {
        // Link pieces to subcase related to the agendaitem
        const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
        if (agendaActivity) {
          const subcase = yield agendaActivity.subcase;
          const currentSubcaseLinkedPieces = yield subcase.hasMany('linkedPieces').reload();
          const subcasePieces = currentSubcaseLinkedPieces.pushObjects(allPiecesToLink);
          subcase.set('linkedPieces', subcasePieces);
          yield subcase.save();
        }
      } else if (this.itemType === 'subcase') {
        // Link pieces to all agendaitems that are related to the subcase via an agendaActivity
        // and related to an agenda in the design status
        const agendaitems = yield this.store.query('agendaitem', {
          'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
          'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
        });
        const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
          const currentAgendaitemLinkedPieces = await agendaitem.hasMany('linkedPieces').reload();
          const agendaitempieces = currentAgendaitemLinkedPieces.pushObjects(allPiecesToLink);
          agendaitem.set('linkedPieces', agendaitempieces);
          await agendaitem.save();
        });
        yield all(agendaitemUpdates);
      }

      // Link pieces to subcase/agendaitem
      const currentLinkedPieces = yield this.args.agendaitemOrSubcase.hasMany('linkedPieces').reload();
      const newLinkedpieces = currentLinkedPieces.pushObjects(allPiecesToLink);
      this.args.agendaitemOrSubcase.set('linkedPieces', newLinkedpieces);
      yield this.args.agendaitemOrSubcase.save();
      this.linkedPieces = newLinkedpieces;
    }

    this.newLinkedPieces = A([]);
    this.isOpenLinkedPieceModal = false;
  }

  @task
  *unlinkDocumentContainer(documentContainer) {
    const linkedPiecesToRemove = (yield documentContainer.pieces).toArray();

    if (this.itemType === 'agendaitem') {
      // Unlink pieces from subcase related to the agendaitem
      const agendaActivity = yield this.args.agendaitemOrSubcase.agendaActivity;
      if (agendaActivity) {
        const subcase = yield agendaActivity.subcase;
        const currentSubcaseLinkedPieces = yield subcase.hasMany('linkedPieces').reload();
        const subcasePieces = currentSubcaseLinkedPieces.removeObjects(linkedPiecesToRemove);
        subcase.set('linkedPieces', subcasePieces);
        yield subcase.save();
      }
    } else if (this.itemType === 'subcase') {
      // Unlink pieces from all agendaitems that are related to the subcase via an agendaActivity
      // and related to an agenda in the design status
      const agendaitems = yield this.store.query('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.agendaitemOrSubcase.get('id'),
        'filter[agenda][status][:id:]': config.agendaStatusDesignAgenda.id,
      });
      const agendaitemUpdates = agendaitems.map(async(agendaitem) => {
        const currentAgendaitemLinkedPieces = await agendaitem.hasMany('linkedPieces').reload();
        const agendaitempieces = currentAgendaitemLinkedPieces.removeObjects(linkedPiecesToRemove);
        agendaitem.set('linkedPieces', agendaitempieces);
        await agendaitem.save();
      });
      yield all(agendaitemUpdates);
    }

    // Unlink pieces from subcase/agendaitem
    const currentLinkedPieces = yield this.args.agendaitemOrSubcase.hasMany('linkedPieces').reload();
    const newLinkedpieces = currentLinkedPieces.removeObjects(linkedPiecesToRemove);
    this.args.agendaitemOrSubcase.set('linkedPieces', newLinkedpieces);
    yield this.args.agendaitemOrSubcase.save();
    this.linkedPieces = newLinkedpieces;
  }
}
