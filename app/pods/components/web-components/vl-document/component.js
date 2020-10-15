import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  intl: service(),
  store: service(),
  toaster: service(),
  fileService: service(),
  currentSession: service(),

  async didInsertElement() {
    this._super(...arguments);
  },

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

  isDeletable: computed('piece.agendaitem', async function() {
    const nextPiece = await this.piece.get('nextPiece');
    if (nextPiece) {
      return false;
    }
    const agendaitem = await this.piece.get('agendaitem');
    if (agendaitem) {
      const agendaitemsFromQuery = await this.store.query('agendaitem', {
        filter: {
          pieces: {
            id: this.piece.id,
          },
        },
      });
      return agendaitemsFromQuery.length === 1;
    }
    return true;
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
