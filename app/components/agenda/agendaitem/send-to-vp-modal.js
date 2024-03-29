import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { groupBySubcaseName } from 'frontend-kaleidos/utils/vp';
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
  @tracked piecesToBeSent = [];
  @tracked showMissingPieces;
  @tracked showPieces;
  @tracked decisionsReleased;
  @tracked comment;
  @tracked internalDecisionPublicationActivity;
  @tracked nothingToBeSent = true;

  isComplete = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  isModalDisabled() {
    if (this.piecesToBeSent.length == 0
    || this.subcasesWithPieces.length == 0) {
      this.nothingToBeSent = true;
    } else {
      this.nothingToBeSent = false;
    }
  }

  loadData = task(async () => {
    await this.loadInternalDecisionPublicationActivity();
    await this.loadPieces();
    this.isModalDisabled();
  });

  async loadPieces () {
    const pieces = await this.parliamentService.getPiecesReadyToBeSent(this.args.agendaitem);
    if (pieces) {
      if (pieces.ready) {
        this.subcasesWithPieces = groupBySubcaseName(pieces.ready);
      }
      if (pieces.missing && pieces.missing.length > 0) {
        this.subcasesWithMissingPieces = groupBySubcaseName(pieces.missing);
        this.isComplete = false;
      } else {
        this.isComplete = !!this.internalDecisionPublicationActivity?.startDate;
      }
      if (pieces.required) {
        this.piecesToBeSent = pieces.required.filter((piece) => !this.isDisabled(piece.accessLevel));
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
    let sendToVpJob;
    if (this.piecesToBeSent) {
      sendToVpJob = await this.parliamentService.sendToVP(
        this.args.agendaitem,
        this.piecesToBeSent,
        this.comment,
        this.isComplete
      );
    }
    this.args?.onClose(sendToVpJob.job, sendToVpJob.toast);
  });

  getAccessLevel = async(accessLevelUri) => {
    const accessLevel = await this.store.queryOne('concept', {
      'filter[:uri:]': accessLevelUri
    })
    return accessLevel;
  }

  isDisabled = (accessLevelUri) => {
    return accessLevelUri !== CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID &&
    accessLevelUri !== CONSTANTS.ACCESS_LEVELS.PUBLIEK;
  }

  isSelected = (pieceDescription) => {
    for (const piece of this.piecesToBeSent) {
      if (piece.uri === pieceDescription.uri) {
        return true;
      }
    }
    return false;
  }

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
      list.push('ondertekende PDF');
    }
    if (list.length) {
      return `(${formatter.format(list)})`;
    }
    return '';
  }

  @action
  togglePieceSelection(pieceDescription) {
    let index = -1;
    for (let i = 0; i < this.piecesToBeSent.length; i++) {
      if(this.piecesToBeSent[i].uri === pieceDescription.uri) {
        index = i;
      }
    }
    if (index > -1) {
      this.piecesToBeSent.splice(index, 1);
    } else {
      this.piecesToBeSent.push(pieceDescription);
    }
    this.isModalDisabled();
  }
}
