import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SearchDecisionResultFilterComponent extends Component {
  @service conceptStore;

  @tracked selectedDecisionResultCodesIds = this.args.selected || [];
  @tracked selectedDecisionResultCodes = [];
  @tracked decisionResultCodes = [];

  constructor() {
    super(...arguments);

    this.loadDecisionResultCodes.perform();
  }

  loadDecisionResultCodes = task(async () => {
    this.decisionResultCodes = (await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.DECISION_RESULT_CODES
    )).slice();
    if (this.selectedDecisionResultCodesIds.length) {
      this.selectedDecisionResultCodes = this.decisionResultCodes.filter(decisionResultCode =>
        this.selectedDecisionResultCodesIds.includes(decisionResultCode.id)
      );
    }
  });

  @action
  onChangeDecisionResultCodes(selectedDecisionResultCodes) {
    this.selectedMandateesIds = selectedDecisionResultCodes.map((decisionResultCode) => decisionResultCode.id);
    this.args.onChange?.(this.selectedMandateesIds);
  }
}
