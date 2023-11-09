import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewDetailsSignaturesTabComponent extends Component {
  @service intl;
  @service store;
  @service signatureService;
  @service toaster;

  @tracked signMarkingActivity;
  @tracked hasMarkedSignFlow;

  @tracked meeting;
  @tracked agendaitem;
  @tracked decisionActivity;
  @tracked canManageSignFlow = false;
  @tracked isOpenVerifyDeleteSignFlow = false;

  signers = [];
  approvers = [];
  notificationAddresses = [];

  constructor() {
    super(...arguments);
    this.loadSignatureRelatedData.perform();
    this.loadCanManageSignFlow.perform();
  }

  get agendaitemIsRetracted() {
    return this.decisionActivity?.get('isRetracted');
  }

  loadSignatureRelatedData = task(async () => {
    this.signMarkingActivity = await this.args.piece.belongsTo('signMarkingActivity').reload();
    this.hasMarkedSignFlow = await this.signatureService.hasMarkedSignFlow(this.args.piece);
    // we want to get the agendaitem this piece is linked to so we can use a treatment of it later
    // it should be the latest version, although any version should yield the same treatment if they are all versions on 1 agenda
    // There are situations where 1 piece is linked to different versions of agendaitems on multiple agendas (postponed)
    // in that case do we just pick the latest created ?
    this.agendaitem = await this.store.queryOne('agendaitem', {
      'filter[pieces][:id:]': this.args.piece.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    const treatment = await this.agendaitem?.treatment;
    this.decisionActivity = await treatment?.decisionActivity;

    if (!this.agendaitem) {
      // If the current piece is not linked to an agendaitem, try to find if
      // it's linked to a decision activity (in case it's the report) or a
      // meeting (in case it's the minutes), in which case it can be signed
      this.decisionActivity = await this.store.queryOne('decision-activity', {
        'filter[report][:id:]': this.args.piece.id,
      });
      let meetingFilter = {};
      if (this.decisionActivity) {
        // The current piece is the report of a decision activity, we still need
        // the meeting
        meetingFilter = {
          'filter[agendas][agendaitems][treatment][decision-activity][:id:]': this.decisionActivity.id,
        };
      } else {
        // The current piece could be the minutes of a meeting
        meetingFilter = {
          'filter[minutes][:id:]': this.args.piece.id,
        };
      }
      this.meeting = await this.store.queryOne('meeting', meetingFilter);
    }

    await this.decisionActivity?.decisionResultCode;
  });

  markForSignFlow = task(async (marked) => {
    try {
      if (marked) {
        await this.signatureService.markDocumentForSignature(
          this.args.piece,
          this.decisionActivity,
          this.meeting,
        );
      } else {
        const signSubcase = await this.signMarkingActivity.signSubcase;
        const signFlow = await signSubcase.signFlow;
        await this.signatureService.removeSignFlow(signFlow);
      }
      await this.args.piece.reload();
      this.signMarkingActivity = await this.args.piece.signMarkingActivity;
      this.hasMarkedSignFlow = await this.signatureService.hasMarkedSignFlow(this.args.piece);
    } catch {
      this.toaster.error(
        this.intl.t('create-sign-marking-error-message'),
        this.intl.t('warning-title')
      );
    }
  });

  loadCanManageSignFlow = task(async () => {
    this.canManageSignFlow = await this.signatureService.canManageSignFlow(
      this.args.piece
    );
  });

  verifyDeleteSignFlow = task(async () => {
    if (this.signMarkingActivity) {
      const signSubcase = await this.signMarkingActivity.signSubcase;
      const signFlow = await signSubcase.signFlow;
      await this.signatureService.removeSignFlow(signFlow);
      await this.loadSignatureRelatedData.perform();
    }
    this.isOpenVerifyDeleteSignFlow = false;
  });
}
