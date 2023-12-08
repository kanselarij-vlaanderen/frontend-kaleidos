import Component from '@glimmer/component'; 
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SubmissionsAlertComponent extends Component {
  @tracked showActivity = null;

  @action
  showModalFor(submissionActivity) {
    this.showActivity = submissionActivity;
  }

  @action
  closeModal() {
    this.showActivity = null;
  }
}