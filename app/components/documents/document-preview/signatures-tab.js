import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

export default class DocumentsDocumentPreviewDetailsSignaturesTabComponent extends Component {
  @service currentSession;
  @service store;

  @tracked signMarkingActivity;
  @tracked agendaitem;
  @tracked signatureRequested;

  @tracked isShowAddCC = false;

  @action
  showAddCC() {
    this.isShowAddCC = true;
  }

  @action
  closeAddCC() {
    this.isShowAddCC = false;
  }

  constructor() {
    super(...arguments);
    this.loadSignatureRelatedData.perform();
    this.signatureRequested = false;
  }

  @task
  *loadSignatureRelatedData() {
    this.signMarkingActivity = yield this.args.piece.signMarkingActivity;
    this.signatureRequested = yield this.args.piece.signMarkingActivity;
    // we want to get the agendaitem this piece is linked to so we can use a treatment of it later
    // it should be the latest version, although any version should yield the same treatment if they are all versions on 1 agenda
    // There are situations where 1 piece is linked to different versions of agendaitems on multiple agendas (postponed)
    // in that case do we just pick the latest created ?
    this.agendaitem = yield this.store.queryOne('agendaitem', {
      'filter[pieces][:id:]': this.args.piece.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    })

  }

  @task
  *markOrUnmarkForSignature() {
    if (!this.signMarkingActivity) {
      const agendaItemTreatment = yield this.agendaitem.treatment;
      const decisionActivity = yield agendaItemTreatment.decisionActivity;
      yield this.args.markForSignature(this.args.piece, decisionActivity);
      this.signatureRequested = true;
    } else {
      yield this.args.unmarkForSignature(this.args.piece);
      this.signatureRequested = false;
    }
    yield this.loadSignatureRelatedData.perform();
  }

  @tracked isShowAddMinister = false;
  @tracked isShowCancelSignatures = false;
  @tracked isInEditMode = false;

  @action
  showAddMinister() {
    this.isShowAddMinister = true;
  }

  @action
  closeAddMinister() {
    this.isShowAddMinister = false;
  }

  @action
  showCancelSignatures() {
    this.isShowCancelSignatures = true;
  }

  @action
  closeCancelSignatures() {
    this.isShowCancelSignatures = false;
  }

  @action
  putInEditMode() {
    this.isInEditMode = !this.isInEditMode;
  }
}
