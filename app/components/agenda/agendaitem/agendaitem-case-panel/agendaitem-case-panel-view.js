import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
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

  @task
  *loadDecisionmakingFlow() {
    if (this.args.subcase) {
      this.decisionmakingFlow = yield this.args.subcase.decisionmakingFlow;
    }
  }

  @task
  *loadDecisionActivity() {
    const treatment = yield this.args.agendaitem.treatment;
    this.decisionActivity = yield treatment?.decisionActivity;
    yield this.decisionActivity?.decisionResultCode;
  }

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
