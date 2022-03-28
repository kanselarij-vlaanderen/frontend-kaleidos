import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

/**
 * @argument {boolean} hideLabel Whether to hide the label of the dropdown
 * @argument {boolean} initializeEmptyKind Whether to initialize the dropdown to the default meeting kind of no meeting kind was provided
 * @argument {function} setAction Action to perform once a meeting kind has been selected
 * @argument {MeetingKindModel} kind (Optional) The meeting kind to set the dropdown to
 */
export default class UtilsKindSelector extends Component {
  @service store;
  @tracked kind = null;

  constructor() {
    super(...arguments);

    this.kind = this.args.kind;
    this.loadOptions.perform();
  }

  @task
  *loadOptions() {
    yield this.store.findAll('meeting-kind', { reload: false });
    if (this.args.initializeEmptyKind && this.args.kind === null || this.args.kind === undefined) {
      this.setAction(this.options.firstObject);
    }
  }

  get options() {
    return this.store.peekAll('meeting-kind');
  }

  @action
  setAction(kind) {
    this.kind = kind;
    this.args.setAction(kind);
  }
}
