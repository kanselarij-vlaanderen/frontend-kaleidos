import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';


export default class UrgencyLevelCheckboxComponent extends Component {
  @tracked urgencyLevels = null;
  @tracked checkboxValue;

  @service store;


  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.urgencyLevels = yield this.store.query('urgency-level', {});
    const urgencyLevel = yield this.args.urgencyLevel;
    this.checkboxValue = urgencyLevel.uri === CONFIG.URGENCY_LEVELS.spoedprocedure;
  }

  @action
  toggleUrgency(value) {
    const uri = value ? CONFIG.URGENCY_LEVELS.spoedprocedure : CONFIG.URGENCY_LEVELS.standaard;
    const urgencyLevel = this.urgencyLevels.find((level) => level.uri === uri);
    this.args.onChange(urgencyLevel);
  }
}
