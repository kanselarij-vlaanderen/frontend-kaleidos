import Component from '@glimmer/component';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class UrgencyLevelCheckboxComponent extends Component {
  @service store;

  @tracked urgencyLevels = null;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.urgencyLevels = yield this.store.query('urgency-level', {});
  }

  get isUrgent() {
    const urgencyLevel = this.args.urgencyLevel;
    return urgencyLevel.uri === CONFIG.URGENCY_LEVELS.spoedprocedure;
  }

  @action
  toggleUrgency(value) {
    const uri = value ? CONFIG.URGENCY_LEVELS.spoedprocedure : CONFIG.URGENCY_LEVELS.standaard;
    const urgencyLevel = this.urgencyLevels.find((level) => level.uri === uri);
    this.args.onChange(urgencyLevel);
  }
}
