import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SubmissionsOverviewHeaderComponent extends Component {
  @service currentSession;
  @service router;

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }
}
