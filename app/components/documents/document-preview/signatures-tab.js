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

  loadSignatureRelatedData = task(async () => {
    this.signMarkingActivity = await this.args.piece.signMarkingActivity;
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
  });

  createSignFlow = task(async () => {
    try {
      await this.signatureService.createSignFlow(
        this.args.piece,
        this.decisionActivity,
        this.signers,
        this.approvers,
        this.notificationAddresses,
      );
      await this.args.piece.reload();
      this.signMarkingActivity = await this.args.piece.signMarkingActivity;
      this.toaster.success(
        this.intl.t('document-was-sent-to-signinghub'),
        this.intl.t('successfully-started-sign-flow')
      )
    } catch {
      this.toaster.error(
        this.intl.t('create-sign-flow-error-message'),
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
    await this.signatureService.removeSignFlow(this.args.piece);
    await this.loadSignatureRelatedData.perform();
    this.isOpenVerifyDeleteSignFlow = false;
  });
}
