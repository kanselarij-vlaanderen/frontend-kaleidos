import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, computed
} from '@ember/object';

export default class SubcaseTitles extends Component {
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
