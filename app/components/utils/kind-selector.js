import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument {Concept} selectedKind The meeting kind to set the dropdown to
 * @argument {function} onChange Action to perform once a meeting kind has been selected
 * @argument {boolean} disabled
 */
export default class UtilsKindSelector extends Component {
  @service store;

  @tracked options;

  constructor() {
    super(...arguments);

    this.loadKinds.perform();
  }

  get isLoading() {
    return this.args.isLoading || this.loadKinds.isRunning;
  }

  @task
  *loadKinds() {
    this.options = yield this.store.queryConceptsForConceptScheme(CONSTANTS.CONCEPT_SCHEMES.VERGADERACTIVITEIT);
  }
}
