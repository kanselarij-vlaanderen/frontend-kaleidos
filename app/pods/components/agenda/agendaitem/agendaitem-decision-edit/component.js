import Component from "@glimmer/component";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { task } from 'ember-concurrency';

export default class AgendaItemDecisionEditComponent extends Component {
  @service store;

  get treatment () {
    return this.args.agendaItemTreatment;
  }

  constructor() {
    super(...arguments);
    this.decisionResultCodes.perform(); // Load codelist
  }

  @(task(function * () {
    return yield this.store.findAll('decision-result-code');
  })) decisionResultCodes;

  @action
  changeDecisionResultCode(resultCode) {
    this.treatment.set('decisionResultCode', resultCode);
  }

  @(task(function * () {
    yield this.treatment.save();
    if (this.args.onSave) {
      this.args.onSave();
    }
  })) saveTreatment;

  @action
  cancelEdit () {
    this.treatment.belongsTo('decisionResultCode').reload(); // "rollback relationship"
    if (this.args.onCancel) {
      this.args.onCancel();
    }
    return this.treatment;
  }
}
