import Component from '@glimmer/component';
import { action } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UrgencyLevelCheckboxComponent extends Component {
  @service store;

  @tracked urgencyLevels = this.store.peekAll('urgency-level').sortBy('position')

  @action
  toggleUrgency(value) {
    const uri = value ? CONSTANTS.URGENCY_LEVELS.SPEEDPROCEDURE : CONSTANTS.URGENCY_LEVELS.STANDARD;
    const urgencyLevel = this.urgencyLevels.find((level) => level.uri === uri);
    this.args.onChange(urgencyLevel);
  }
}
