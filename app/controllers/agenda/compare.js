import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AgendaCompare extends Controller {
  @tracked isShowingChanges;

  @action
    toggleChangesOnly() {
      this.isShowingChanges = !this.isShowingChanges;
  };
}
