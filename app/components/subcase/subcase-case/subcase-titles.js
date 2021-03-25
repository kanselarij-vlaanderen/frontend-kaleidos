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
  get pillClass() {
    return this.getPillClass();
  }

  async getPillClass() {
    const baseClass = 'auk-pill auk-u-text-capitalize';
    const approved = await this.subcase.get('approved');
    if (approved) {
      return `${baseClass} auk-pill--success`;
    }
    return `${baseClass} auk-pill--default`;
  }

  @action
  toggleIsEditingAction() {
    this.toggleIsEditing();
  }
}
