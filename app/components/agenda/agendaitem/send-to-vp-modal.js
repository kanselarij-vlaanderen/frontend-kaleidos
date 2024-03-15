import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { groupBySubcaseName } from 'frontend-kaleidos/utils/vp';

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

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  get isModalDisabled() {
    return this.loadData.isRunning
      || this.subcasesWithPieces.length == 0;
  }

  loadData = task(async () => {
    await this.loadInternalDecisionPublicationActivity();
    await this.loadPiecesToBeSent();
  });

  async loadPiecesToBeSent () {
    this.piecesToBeSent = await this.parliamentService.getPiecesReadyToBeSent(this.args.agendaitem);
    if (this.piecesToBeSent) {
      if (this.piecesToBeSent.ready) {
        this.subcasesWithPieces = groupBySubcaseName(this.piecesToBeSent.ready);
      }
      if (this.piecesToBeSent.missing && this.piecesToBeSent.missing.length > 0) {
        this.subcasesWithMissingPieces = groupBySubcaseName(this.piecesToBeSent.missing);
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
    let sendToVpJob;
    if (this.piecesToBeSent?.ready) {
      sendToVpJob = await this.parliamentService.sendToVP(
        this.args.agendaitem,
        this.piecesToBeSent.ready,
        this.comment,
        this.isComplete
      );
    }
    this.args?.onClose(sendToVpJob.job, sendToVpJob.toast);
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
      list.push('ondertekende PDF');
    }
    if (list.length) {
      return `(${formatter.format(list)})`;
    }
    return '';
  }
}
