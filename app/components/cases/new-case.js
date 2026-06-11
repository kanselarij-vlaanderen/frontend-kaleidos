import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import { cleanPasteInputForTextarea, trimText } from 'frontend-kaleidos/utils/trim-util';

/**
  * @argument didSave: action, passes down the newly created decisionmakingFlow
  * @argument onCancel: action
  */
export default class NewCase extends Component {
  @service store;

  @tracked shortTitle;

  get isCreateDisabled() {
    return (
      isBlank(this.shortTitle) ||
      this.createCase.isRunning
    );
  }

  createCase = task(async () => {
    const now = new Date();
    const _case = this.store.createRecord('case', {
      shortTitle: trimText(this.shortTitle),
      created: now,
    });
    await _case.save();
    const decisionmakingFlow = this.store.createRecord('decisionmaking-flow', {
      case: _case,
      opened: now,
    });
    await decisionmakingFlow.save();
    return this.args.didSave(decisionmakingFlow);
  });

  pasteIntoShortTitle = (pasteEvent) => {
    this.shortTitle = cleanPasteInputForTextarea(pasteEvent, 'case-short-title', this.shortTitle);
  }
}
