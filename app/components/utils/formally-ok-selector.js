import Component from '@glimmer/component';
import CONFIG from 'frontend-kaleidos/utils/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency';

export default class UtilsFormallyOkSelector extends Component {
  /**
   * @argument formallyOkStatusUri: TODO: change to ember object
   * @argument onChange
   * @argument noDefaultOption: show placeholder and have no default
   */

  options;
  defaultOption;

  constructor() {
    super(...arguments);
    this.options = CONFIG.formallyOkOptions;
    this.defaultOption = this.args.noDefaultOption
      ? null
      : this.options.find(
          (option) => option.uri === CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK
        );
  }

  get formallyOkStatus() {
    if (this.args.formallyOkStatusUri) {
      return this.options.find(
        (option) => option.uri === this.args.formallyOkStatusUri
      );
    }
    return null;
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
