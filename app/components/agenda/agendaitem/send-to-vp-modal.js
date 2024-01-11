import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SendToVpModalComponent extends Component {
  /**
   * @argument meeting
   * @argument agendaitem
   * @argument onClose
   */
  @service store;
  @service conceptStore;
  @service intl;
  @service toaster;
  @service parliamentService;

  @tracked subcasesWithPieces = [];
  @tracked subcasesWithMissingPieces = [];
  @tracked piecesToBeSent;
  @tracked showMissingPieces;
  @tracked showPieces;
  @tracked decisionsReleased;
  @tracked comment;
  @tracked internalDecisionPublicationActivity;

  isComplete = false;
  BESLISSINGSFICHE;
  DECREET;
  MEMORIE;
  NOTA;
  ADVIES;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get isModalDisabled() {
    return this.loadData.isRunning
      || this.subcasesWithPieces.length == 0;
  }

  loadData = task(async () => {
    await this.loadDocumentTypes();
    await this.loadInternalDecisionPublicationActivity();
    await this.loadPiecesToBeSent();
  });

  async loadDocumentTypes() {
    this.BESLISSINGSFICHE = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.BESLISSINGSFICHE
    );
    this.DECREET = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.DECREET
    );
    this.MEMORIE = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.MEMORIE
    );
    this.NOTA = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.NOTA
    );
    this.ADVIES = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.ADVIES
    );
  }

  groupBySubcaseName (pieces) {
    let subcasesWithPieces = [];
    let subcasesObject = {};
    for (const pieceDescription of pieces) {
      if (pieceDescription.subcaseName) {
        if (!subcasesObject[pieceDescription.subcaseName]) {
          subcasesObject[pieceDescription.subcaseName] = [];
        }
        subcasesObject[pieceDescription.subcaseName].push(pieceDescription);
      } else {
        if (!subcasesObject.default) {
          subcasesObject.default = [];
        }
        subcasesObject.default.push(pieceDescription);
      }
    }
    for (const subcaseName in subcasesObject) {
      if (Object.prototype.hasOwnProperty.call(subcasesObject, subcaseName)) {
        subcasesWithPieces.push({
          subcaseName: subcaseName !== 'default' ? subcaseName : undefined,
          pieces: subcasesObject[subcaseName]
        })
      }
    }
    return subcasesWithPieces;
  }

  async loadPiecesToBeSent () {
    this.piecesToBeSent = await this.parliamentService.getPiecesReadyToBeSent(this.args.agendaitem);
    if (this.piecesToBeSent) {
      if (this.piecesToBeSent.ready) {
        this.subcasesWithPieces = this.groupBySubcaseName(this.piecesToBeSent.ready);
      }
      if (this.piecesToBeSent.missing && this.piecesToBeSent.missing.length > 0) {
        this.subcasesWithMissingPieces = this.groupBySubcaseName(this.piecesToBeSent.missing);
        this.isComplete = false;
      } else {
        this.isComplete = !!this.internalDecisionPublicationActivity?.startDate;
      }
    }
    this.showPieces = this.subcasesWithPieces.length > 0;
    this.showMissingPieces = this.subcasesWithMissingPieces.length > 0;
  }


  async loadInternalDecisionPublicationActivity() {
    this.internalDecisionPublicationActivity = await this.store.queryOne('internal-decision-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      include: 'status',
    });
    this.decisionsReleased = !!this.internalDecisionPublicationActivity?.startDate;
  }

  sendToVP = task(async () => {
    if (this.piecesToBeSent?.ready) {
      await this.parliamentService.sendToVP(
        this.args.agendaitem,
        this.piecesToBeSent.ready,
        this.comment,
        this.isComplete
      );
    }
    this.args?.onClose();
  });

  pieceFileTypes = async (pieceDescription) => {
    const files = await pieceDescription.files;
    let pdf, word, signed;
    for (const file of files) {
      if (file.isPdf) {
        pdf = true;
      }
      if (file.isWord) {
        word = true;
      }
      if (file.isSigned) {
        signed = true;
      }
    }
    const formatter = new Intl.ListFormat('nl-be');
    const list = [];
    if (pdf) {
      list.push('PDF');
    }
    if (word) {
      list.push('Word');
    }
    if (signed) {
      list.push('ondertekend');
    }
    if (list.length) {
      return `(${formatter.format(list)})`;
    }
    return '';
  }

  @action
  onChangeComment(event) {
    this.comment = event.target.value;
  }
}
