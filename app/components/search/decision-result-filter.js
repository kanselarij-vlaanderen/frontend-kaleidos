import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SearchDecisionResultFilterComponent extends Component {
  @service conceptStore;

  @tracked decisionResultCodes = [];

  constructor() {
    super(...arguments);

    this.loadDecisionResultCodes.perform();
  }

  get allSelected() {
    return (
      this.decisionResultCodes.length &&
      this.args.selected?.length === this.decisionResultCodes.length &&
      this.decisionResultCodes.every((i) => this.args.selected?.includes(i.id))
    );
  }

  loadDecisionResultCodes = task(async () => {
    this.decisionResultCodes = (await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.DECISION_RESULT_CODES
    )).toArray();
  });

  @action
  toggle(decisionResultCode) {
    const selected = [...this.args.selected];
    const index = selected.indexOf(decisionResultCode.id);
    if (index >= 0) {
      selected.splice(index, 1);
    } else {
      selected.push(decisionResultCode.id);
    }
    this.args.onChange?.(selected);
  }

  @action toggleAll() {
    let selected = [];
    if (this.allSelected) {
      // Disable all
    } else {
      // Enable all
      selected = [...this.decisionResultCodes];
    }
    this.args.onChange?.(selected.map((i) => i.id));
  }
}
