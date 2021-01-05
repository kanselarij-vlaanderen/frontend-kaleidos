import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendaitemTitles extends Component {
  classNames = ['auk-u-mb-8'];
  @service currentSession;

  get pillClass() {
    const baseClass = 'vl-pill vl-u-text--capitalize';
    if (this.args.subcase) {
      if (this.args.subcase.approved) {
        return `${baseClass} vl-pill--success`;
      }
    }
    return baseClass;
  }

  @action
  toggleIsEditingAction() {
    this.args.toggleIsEditing();
  }
}
