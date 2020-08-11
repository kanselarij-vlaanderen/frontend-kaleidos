import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AgendaitemTitles extends Component {
  classNames = ['vl-u-spacer-extended-bottom-l'];
  @service currentSession;

  get pillClass() {
    const baseClass = 'vl-pill vl-u-text--capitalize';
    if (this.args.agendaActivity) {
      if (this.args.agendaActivity.approved) {
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
