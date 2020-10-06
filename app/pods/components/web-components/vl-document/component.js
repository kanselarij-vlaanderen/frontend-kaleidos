import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  intl: service(),
  toaster: service(),
  fileService: service(),
  currentSession: service(),

  async didInsertElement() {
    this._super(...arguments);
  },

  classNames: ['vlc-document-card-item'],
  classNameBindings: ['aboutToDelete'],
  piece: null,

  aboutToDelete: computed('piece.aboutToDelete', function() {
    if (this.piece) {
      if (this.piece.get('aboutToDelete')) {
        return 'vlc-document--deleted-state';
      }
    }
    return null;
  }),

  async deletePieceWithUndo() {
    const pieceToDelete = this.get('pieceToDelete');
    const documentContainer = await pieceToDelete.get('documentContainer');
    await this.fileService.get('deletePieceWithUndo').perform(pieceToDelete);
    // when cancelled, the aboutToDelete flag will be false
    if (this.onDeletePieceFromContainer && pieceToDelete.aboutToDelete) {
      this.onDeletePieceFromContainer(documentContainer);
    }
    // TODO delete orphan container if last piece is deleted
  },

  actions: {
    cancel() {
      this.set('pieceToDelete', null);
      this.set('isVerifyingDelete', false);
    },

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
        this.fileService.reverseDelete(this.pieceToDelete.get('id'));
        this.toaster.toasts.removeObject(verificationToast);
      };
      this.toaster.displayToast.perform(verificationToast);
      this.deletePieceWithUndo();
      this.set('isVerifyingDelete', false);
    },

    deletePiece(piece) {
      this.set('pieceToDelete', piece);
      this.set('isVerifyingDelete', true);
    },

    async showPieceViewer(piece) {
      window.open(`/document/${(await piece).get('id')}`);
    },
  },

});
