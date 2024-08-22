import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SubmissionsOverviewHeaderComponent extends Component {

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }
}
