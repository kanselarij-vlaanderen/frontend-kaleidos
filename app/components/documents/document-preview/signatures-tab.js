import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewDetailsSignaturesTabComponent extends Component {
  @service intl;
  @service store;
  @service signatureService;
  @service toaster;

  @tracked signPreparationActivity;
  @tracked signMarkingActivity;

  @tracked isOpenVerifyDeleteSignFlow = false;

  constructor() {
    super(...arguments);
    this.loadSignatureRelatedData.perform();
  }

  loadSignatureRelatedData = task(async () => {
    this.signMarkingActivity = await this.args.piece.signMarkingActivity;
    this.signPreparationActivity = await this.signMarkingActivity?.signPreparationActivity;
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
