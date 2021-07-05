import Component from '@glimmer/component';
import CONFIG from 'frontend-kaleidos/utils/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency-decorators';

export default class UtilsFormallyOkSelector extends Component {
  /**
   * @argument formallyOkStatusUri: TODO: change to ember object
   * @argument onChange
   */

  options;
  defaultOption;

  constructor() {
    super(...arguments);
    this.options = CONFIG.formallyOkOptions;
    this.defaultOption = this.options.find((option) => option.uri === CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK);
  }

  get formallyOkStatus() {
    return this.options.find((option) => option.uri === this.args.formallyOkStatusUri);
  }

  get selectedStatus() {
    return this.formallyOkStatus || this.defaultOption;
  }

  @task
  *onChange(newStatus) {
    if (this.args.onChange) {
      yield this.args.onChange(newStatus.uri);
    }
  }
}
