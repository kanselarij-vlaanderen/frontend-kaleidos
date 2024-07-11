import Component from '@glimmer/component';
import CONFIG from 'frontend-kaleidos/utils/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { action  } from '@ember/object';
import { task } from 'ember-concurrency';

export default class AgendaFormallyOkEdit extends Component {
  /**
   * @argument formallyOkStatusUri
   * @argument onChange
   * @argument onSave
   */

  formallyOkOptions;
  @tracked selectedFormallyOkOption;

  constructor() {
    super(...arguments);
    this.formallyOkOptions = CONFIG.formallyOkOptions;
    const defaultOption = this.formallyOkOptions.find((option) => option.uri === CONSTANTS.ACCEPTANCE_STATUSSES.NOT_YET_OK);
    this.selectedFormallyOkOption = this.formallyOkStatus || defaultOption;
  }

  get formallyOkStatus() {
    return this.formallyOkOptions.find((formallyOkOption) => formallyOkOption.uri === this.args.selectedFormallyOk.uri);
  }

  @action
  onChange(formallyOkOption) {
    this.selectedFormallyOkOption = formallyOkOption;
  }

  @task
  *onSave() {
    if (this.args.onSave) {
      yield this.args.onSave(this.selectedFormallyOkOption.uri);
      }
    this.args.cancelEdit();
  }
}
