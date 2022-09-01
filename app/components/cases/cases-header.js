import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * @argument didCreateNewCase: action passing down a newly created decisionmaking-flow.
 */
export default class CasesHeader extends Component {
  @service currentSession;
  @tracked isAddingCase = false;

  @action
  toggleAddingCase() {
    this.isAddingCase = !this.isAddingCase;
  }

  @action
  saveNewCase() {
    this.toggleAddingCase();
    this.args.didCreateNewCase(...arguments);
  }
}
