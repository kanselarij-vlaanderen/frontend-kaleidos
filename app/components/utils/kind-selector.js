import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import EmberObject from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';

/**
 * @argument {selectedKind}
 * @argument {setAction}
 */
export default class UtilsKindSelectorComponent extends Component {
  classNames = ['auk-u-mb-2'];
  options = CONFIG.MINISTERRAAD_TYPES.TYPES.map((meetingType) =>
    EmberObject.create(meetingType)
  );
  defaultKind = this.options[0];
  @tracked isLoading = null;
  @tracked hideLabel = null;
  @tracked _selectedKind = null;

  constructor() {
    super(...arguments);

    if (!this.args.selectedKind) {
      this.setAction(this.selectedKind);
    }
  }

  get selectedKind() {
    if (this._selectedKind) {
      return this._selectedKind;
    } else if (this.args.selectedKind) {
      return this.options.find(
        (kind) => kind.uri === this.args.selectedKind.uri || this.defaultKind
      );
    } else {
      return this.defaultKind;
    }
  }

  set selectedKind(kind) {
    this._selectedKind = kind;
  }

  @action
  setAction(meetingType) {
    this.selectedKind = meetingType;
    this.args.setAction(meetingType.uri);
  }
}
