import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionResultSelect extends Component {
  @service store;

  @tracked decisionResultCodes;

  constructor() {
    super(...arguments);
    this.loadDecisionResultCodes.perform();
  }

  @task
  *loadDecisionResultCodes() {
    const codes = yield this.store.query('concept', {
      'filter[concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.DECISION_RESULT_CODES,
      reload: true,
      sort: 'position',
    });
    this.decisionResultCodes = codes;
  }
}
