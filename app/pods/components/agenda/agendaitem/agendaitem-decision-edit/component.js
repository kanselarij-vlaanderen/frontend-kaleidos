import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { task } from 'ember-concurrency';
import { tracked } from "@glimmer/tracking";

export default class AgendaItemDecisionEditComponent extends Component {
  @service store;
  @tracked treatment = this.args.agendaItemTreatment;
  @tracked decisionResultCodes = [];
  @tracked decisionResultCodesLoaded = false;

  constructor() {
    super(...arguments);
    this.store.findAll('decision-result-code', { reload: true }).then(codes => {
      this.decisionResultCodes = codes;
      this.decisionResultCodesLoaded = true;
    });
  }

  @action
  fetchDecisionResultCodes() {
    this.findDecisionResultCodes.perform(); // Load codelist
  }

  @action
  changeDecisionResultCode(resultCode) {
    this.treatment.set('decisionResultCode', resultCode);
  }

  @(task(function* () {
    yield this.treatment.save();
    if (this.args.onSave) {
      this.args.onSave();
    }
  })) saveTreatment;

  @action
  cancelEdit() {
    this.treatment.belongsTo('decisionResultCode').reload(); // "rollback relationship"
    if (this.args.onCancel) {
      this.args.onCancel();
    }
    return this.treatment;
  }
}
