import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class DocumentsDocumentPreviewDetailsDetailsTabComponent extends Component {
  @service currentSession;
  @service store;
  @service signatureService;

  /** @type {SignFlowContext|undefined} */
  @tracked signFlowContext;
  @tracked status;
  @tracked agendaitem;

  constructor() {
    super(...arguments);
    this.loadAgendaitem.perform();
    this.loadSignFlow.perform();
  }

  get isLoading() {
    return (
      this.loadAgendaitem.isRunning ||
      this.loadSignFlow.isRunning ||
      this.markOrUnmarkForSignature.isRunning
    );
  }

  get isShownFooter() {
    // Currently "Aanbieden" is the only button, which requires the right permissions
    //  showing empty footer would look weird.
    return this.signatureService.canUserPrepare;
  }

  @task
  *loadAgendaitem() {
    // we want to get the agendaitem this piece is linked to so we can use a treatment of it later
    // it should be the latest version, although any version should yield the same treatment if they are all versions on 1 agenda
    // There are situations where 1 piece is linked to different versions of agendaitems on multiple agendas (postponed)
    // in that case do we just pick the latest created ?
    this.agendaitem = yield this.store.queryOne('agendaitem', {
      'filter[pieces][:id:]': this.args.piece.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
  }

  @task
  *loadSignFlow() {
    const signFlow = yield this.store.queryOne('sign-flow', {
      'filter[sign-subcase][sign-marking-activity][piece][:id:]':
        this.args.piece.id,
      include: [
        'sign-subcase',
        'sign-subcase.sign-marking-activity',
        'sign-subcase.sign-preparation-activity',
        'sign-subcase.sign-signing-activities',
      ].join(','),
    });
    if (signFlow) {
      this.signFlowContext = yield this.signatureService.createSignFlowContext(
        signFlow
      );
    } else {
      this.signFlowContext = undefined;
    }
  }

  get isInSignFlow() {
    return !!this.signFlowContext;
  }

  @task
  *markOrUnmarkForSignature() {
    if (!this.isInSignFlow) {
      const treatments = yield this.agendaitem.treatments;
      const agendaItemTreatment = treatments.firstObject;
      yield this.args.markForSignature(this.args.piece, agendaItemTreatment);
    } else if (this.signFlowContext.status.isMarked) {
      yield this.args.unmarkForSignature(this.args.piece);
    }
    yield this.loadSignFlow.perform();
  }
}
