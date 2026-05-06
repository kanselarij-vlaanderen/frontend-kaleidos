import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { service } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument agenda
 * @argument newsItem
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class AgendaitemCasePanelView extends Component {
  
  @service toaster;
  @service intl;

  @tracked decisionmakingFlow;
  @tracked decisionActivity;
  @tracked isEditingFormallyOk = false;

  constructor() {
    super(...arguments);
    this.loadDecisionmakingFlow.perform();
    this.loadDecisionActivity.perform();
  }

  loadDecisionmakingFlow = task(async () => {
    if (this.args.subcase) {
      this.decisionmakingFlow = await this.args.subcase.decisionmakingFlow;
    }
  });

  loadDecisionActivity = task(async () => {
    const treatment = await this.args.agendaitem.treatment;
    this.decisionActivity = await treatment?.decisionActivity;
    await this.decisionActivity?.belongsTo('decisionResultCode').reload();
  });

  @action
  async setAndSaveFormallyOkStatus(newFormallyOkUri) {
    this.args.agendaitem.formallyOk = newFormallyOkUri;
    const status = CONFIG.formallyOkOptions.find((type) => type.uri === newFormallyOkUri);
    try {
      await this.args.agendaitem.save();
      this.toaster.success(this.intl.t('successfully-modified-formally-ok-status', {
        status: status.label,
      }));
    } catch {
      this.args.agendaitem.rollbackAttributes();
      this.toaster.error();
    }
  }

  @action
  toggleIsEditingFormallyOk() {
    this.isEditingFormallyOk = !this.isEditingFormallyOk;
  }
}
