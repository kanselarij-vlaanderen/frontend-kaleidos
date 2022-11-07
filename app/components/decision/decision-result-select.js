import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionResultSelect extends Component {
  @service conceptStore;

  @tracked decisionResultCodes;

  constructor() {
    super(...arguments);
    this.loadDecisionResultCodes.perform();
  }

  @task
  *loadDecisionResultCodes() {
    this.decisionResultCodes = yield this.conceptStore.allForConceptScheme(CONSTANTS.CONCEPT_SCHEMES.DECISION_RESULT_CODES);
  }
}
