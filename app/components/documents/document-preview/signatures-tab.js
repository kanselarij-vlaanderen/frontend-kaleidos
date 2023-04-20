import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewDetailsSignaturesTabComponent extends Component {
  @service store;

  @tracked signMarkingActivity;
  @tracked agendaitem;
  @tracked decisionActivity;

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
    });
    const treatment = yield this.agendaitem.treatment;
    this.decisionActivity = yield treatment.decisionActivity;
  }
}
