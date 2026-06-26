import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { task } from 'ember-concurrency';
import { trimText, cleanPasteInputForTextarea } from 'frontend-kaleidos/utils/trim-util';

/**
 * @param {Case} case
 */
export default class EditCase extends Component {
  @tracked shortTitle;

  constructor() {
    super(...arguments);

    this.shortTitle = this.args.case.shortTitle;
  }

  get isSaveDisabled() {
    return (
      isBlank(this.shortTitle) ||
      this.save.isRunning
    );
  }

  save = task(async () => {
    this.args.case.shortTitle = trimText(this.shortTitle);
    await this.args.onSave(this.args.case);
  });

  @action
  close() {
    this.args.onClose();
  }

  pasteIntoShortTitle = (pasteEvent) => {
    this.shortTitle = cleanPasteInputForTextarea(pasteEvent, 'case-short-title', this.shortTitle);
  }
}
