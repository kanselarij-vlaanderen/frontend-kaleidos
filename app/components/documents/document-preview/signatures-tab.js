import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewDetailsSignaturesTabComponent extends Component {
  @service currentSession;
  @service store;

  @tracked signMarkingActivity;
  @tracked agendaitem;

  constructor() {
    super(...arguments);
    this.loadSignatureRelatedData.perform();
  }

  @task
  *loadSignatureRelatedData() {
    this.signMarkingActivity = yield this.args.piece.signMarkingActivity;
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
    } else {
      yield this.args.unmarkForSignature(this.args.piece);
    }
    yield this.loadSignatureRelatedData.perform();
  }
}
