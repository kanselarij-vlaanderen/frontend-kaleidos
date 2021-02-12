import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';

export default class VlDocument extends Component {
  /**
   * A document card with expandable document history .
   * By default uses the @piece argument, but can fall back to @documentContainer when
   * no piece is provided. In this case the latest version within the container will be shown.
   *
   * @argument piece: a Piece object
   * @argument didDeletePiece: action triggered when a piece has been deleted
   * @argument enableDelete
   */
  @service store;
  @service currentSession;
  @service fileService;
  @service toaster;
  @service intl;

  @tracked piece;
  @tracked file;
  @tracked accessLevel;

  @tracked isVerifyingDelete;

  constructor() {
    super(...arguments);
    this.isVerifyingDelete = false;
    this.loadPieceRelatedData.perform();
  }

  @task
  *loadPieceRelatedData() {
    const piece = this.args.piece;
    if (piece) {
      this.piece = piece; // Assign what we already have, so that can be rendered already
      this.piece = (yield this.store.query('piece', {
        'filter[:id:]': piece.id,
        include: 'file,document-container,document-container.type,access-level',
      })).firstObject;
      this.file = yield this.piece.file;
      this.documentContainer = yield this.piece.documentContainer;
      this.accessLevel = yield this.piece.accessLevel;
    } else {
      throw new Error(`You should provide @piece or @documentContainer as an argument to ${this.constructor.name}`);
    }
  }

  @action
  showPieceViewer() {
    window.open(`/document/${this.piece.id}`);
  }

  // TODO: @enableDelete will replace this
  // isDeletable: computed('piece', 'piece.nextPiece', async function() {
  //   const nextPiece = await this.piece.get('nextPiece');
  //   if (nextPiece) {
  //     return false;
  //   const agendaitemsFromQuery = await this.store.query('agendaitem', {
  //     filter: {
  //       pieces: {
  //         id: this.piece.id,
  //       },
  //     },
  //   });
  //   return agendaitemsFromQuery.length <= 1;
  // }),

  @action
  deletePiece() {
    this.isVerifyingDelete = true;
  }

  async deletePieceWithUndo() {
    await this.fileService.get('deletePieceWithUndo').perform(this.piece);
    // when cancelled, the aboutToDelete flag will be false
    if (this.args.didDeletePiece && this.piece.aboutToDelete) {
      this.args.didDeletePiece(this.piece);
    }
    // TODO delete orphan container if last piece is deleted
  }

  @action
  cancelDelete() {
    this.isVerifyingDelete = false;
  }

  @action
  confirmDelete() {
    const verificationToast = {
      type: 'revert-action',
      title: this.intl.t('warning-title'),
      message: this.intl.t('document-being-deleted'),
      options: {
        timeOut: 15000,
      },
    };
    verificationToast.options.onUndo = () => {
      this.fileService.reverseDelete(this.piece.id);
      this.toaster.toasts.removeObject(verificationToast);
    };
    this.toaster.displayToast.perform(verificationToast);
    this.deletePieceWithUndo();
    this.isVerifyingDelete = false;
  }

  @action
  changeAccessLevel(al) {
    this.piece.set('accessLevel', al);
    this.accessLevel = al;
  }

  @action
  async saveAccessLevel() {
    // TODO make sure not to overwrite things
    await this.piece.save();
    await this.loadPieceRelatedData.perform();
  }

  @action
  async changeConfidentiality(confidential) {
    this.piece.set('confidential', confidential);
    // TODO make sure not to overwrite things
    await this.piece.save();
  }

  @action
  async reloadAccessLevel() {
    await this.loadPieceRelatedData.perform();
  }
}
