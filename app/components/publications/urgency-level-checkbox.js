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
    this.initializeUrgency(this.args.urgencyLevel);
  }

  initializeUrgency(urgencylevel) {
    if (urgencylevel.get('uri') === CONFIG.URGENCY_LEVELS.spoedprocedure) {
      this.checkboxValue = true;
    } else {
      this.checkboxValue = false;
    }
  }

  @action
  toggleUrgency(value) {
    const uri = value ? CONFIG.URGENCY_LEVELS.spoedprocedure : CONFIG.URGENCY_LEVELS.standaard;
    const urgencyLevel = this.urgencyLevels.find((level) => level.uri === uri);

    this.args.onChange(urgencyLevel);
  }
}
