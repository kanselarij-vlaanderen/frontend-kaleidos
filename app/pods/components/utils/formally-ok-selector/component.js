import Component from '@glimmer/component';
import CONFIG from 'fe-redpencil/utils/config';
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
    this.defaultOption = this.options.find((option) => option.uri === CONFIG.notYetFormallyOk);
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
