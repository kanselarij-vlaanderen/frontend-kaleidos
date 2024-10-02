import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';
import sanitize from 'sanitize-filename';

/**
 * @param {Piece} piece
 */
export default class DocumentsDocumentPreviewMobileDocumentDetailsPanel extends Component {
  @service pieceAccessLevelService;
  @service currentSession;

  @tracked documentType;
  @tracked accessLevel;
  @tracked isLastVersionOfPiece;
  @tracked signedPieceCopy;

  constructor() {
    super(...arguments);
    this.loadDetailsData.perform();
    this.loadSignedPieces.perform();
  }

  get isDraftPiece() {
    return this.args.piece.constructor.modelName === 'draft-piece';
  }

  get inlineViewLink() {
    let file = this.args.piece.get('file');
    const derivedFile = file.get('derived');
    if (derivedFile?.get('id')) {
      file = derivedFile;
    }
    if (file) {
      return `${file.get('inlineViewLink')}`;
    }
    // should be unreachable, getter used in template with {{#if @piece.file}}
    return undefined;
  }

  get downloadLinkSourceFile() {
    const file = this.args.piece.get('file');
    if (file) {
      const filename = `${this.args.piece.name}.${file.get('extension')}`;
      const downloadFilename = sanitize(filename, {
        replacement: '_',
      });
      return `${file.get('downloadLink')}?name=${encodeURIComponent(
        downloadFilename
      )}`;
    }
    // should be unreachable, getter used in template with {{#if @piece.file}}
    return undefined;
  }

  @task
  *loadSignedPieces() {
    this.signedPieceCopy = yield this.args.piece?.signedPieceCopy;
    yield this.signedPieceCopy?.belongsTo('accessLevel').reload();
    yield this.signedPieceCopy?.belongsTo('file').reload();
  }

  @task
  *loadDetailsData() {
    this.documentType = yield this.args.documentContainer?.type;
    this.accessLevel = yield this.args.piece.accessLevel;
    this.isLastVersionOfPiece = !isPresent(yield this.args.piece.nextPiece);
  }

  showAlternatePieces = async () => {
    const canViewSignedPiece = await this.canViewSignedPiece();
    const canViewConfidentialPiece = await this.canViewConfidentialPiece();
    const file = await this.args.piece.file;
    const signedPiece = await this.args.piece.signedPiece;
    const signedPieceFile = await signedPiece?.file;
    const signedPieceCopyFile = await this.signedPieceCopy?.file
    return isPresent(file?.derived) ||
      (canViewSignedPiece && isPresent(signedPieceFile)) ||
      (canViewConfidentialPiece && isPresent(signedPieceCopyFile));
  }

  canViewConfidentialPiece = async () => {
    return await this.pieceAccessLevelService.canViewConfidentialPiece(this.args.piece);
  }

  canViewSignedPiece = async () => {
    if (this.currentSession.may('manage-signatures')) {
      return await this.signatureService.canManageSignFlow(this.args.piece);
    }
    return false;
  }
}
