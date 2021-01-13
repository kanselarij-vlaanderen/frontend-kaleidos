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

  @tracked isEnabledPieceEdit = false;
  @tracked isOpenPieceUploadModal = false;
  @tracked defaultAccessLevel;
  @tracked pieces = A([]);
  @tracked newPieces = A([]);

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get iterablePieces() {
    return this.pieces.toArray();
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

    this.pieces = yield this.args.meeting.pieces; // TODO replace with query?
  }

  @action
  enablePieceEdit() {
    this.isEnabledPieceEdit = true;
  }

  @action
  disablePieceEdit() {
    this.isEnabledPieceEdit = false;
  }

  @action
  openPieceUploadModal() {
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
    const pieces = yield this.args.meeting.hasMany('pieces').reload();
    pieces.pushObject(piece);
    yield this.args.meeting.save();
  }

  /**
   * Add new piece to an existing document container
  */
  @task
  *addPiece(piece) {
    yield piece.save();
    const pieces = yield this.args.meeting.hasMany('pieces').reload();
    pieces.pushObject(piece);
    yield this.args.meeting.save();
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
}
