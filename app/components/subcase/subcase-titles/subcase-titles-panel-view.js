// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject as service } from '@ember/service';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import {
  action, computed
} from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/require-tagless-components
export default class SubcaseTitlesPanelView extends Component {
  classNames = ['auk-u-mb-8'];
  @service currentSession;
  subcase = null;

  @computed('subcase.approved')
  get pillSkin() {
    return this.getPillSkin();
  }

  async getPillSkin() {
    const approved = await this.subcase.get('approved');
    if (approved) {
      return 'success';
    }
    return 'default';
  }

  @action
  toggleIsEditingAction() {
    this.toggleIsEditing();
  }
}
