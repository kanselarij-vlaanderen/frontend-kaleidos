import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * @argument {boolean} hideLabel Whether to hide the label of the dropdown
 * @argument {boolean} initializeEmptyKind Whether to initialize the dropdown to the default meeting kind, "Ministerraad", if no meeting kind was provided
 * @argument {function} setAction Action to perform once a meeting kind has been selected
 * @argument {MeetingKindModel} kind (Optional) The meeting kind to set the dropdown to
 */
export default class UtilsKindSelector extends Component {
  @service store;
  @tracked kind = null;
  @tracked options = this.store.peekAll('meeting-kind').sortBy('position'); // Meeting kinds get loaded in the agendas route, so we can just peek them here.
  @tracked defaultKind = this.options.firstObject;

  constructor() {
    super(...arguments);

    this.kind = this.args.kind;
    if (this.args.initializeEmptyKind && !this.args.kind) {
      this.setAction(this.defaultKind);
    }
  }

  @action
  setAction(kind) {
    this.kind = kind;
    this.args.setAction(kind);
  }
}
