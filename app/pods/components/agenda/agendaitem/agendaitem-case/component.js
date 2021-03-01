import Component from '@glimmer/component';
import { inject } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaitemCase extends Component {
  authentication = inject('currentSession');
  @tracked isEditing = false;

  get newsletterInfo() {
    return this.args.agendaitem.get('newsletterInfo');
  }

  get subcases() {
    const subcase = this.args.subcase;
    if (subcase) {
      return subcase.get('subcasesFromCase');
    }
    return null;
  }

  @action
  cancelEditing() {
    this.isEditing = false;
  }

  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }
}
