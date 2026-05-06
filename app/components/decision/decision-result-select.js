import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionResultSelect extends Component {
  @service conceptStore;

  @tracked decisionResultCodes;

  constructor() {
    super(...arguments);
    this.loadDecisionResultCodes.perform();
  }

  loadDecisionResultCodes = task(async () => {
    this.decisionResultCodes = await this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DECISION_RESULT_CODES);
  });
}
