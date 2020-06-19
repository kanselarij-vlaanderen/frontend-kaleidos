import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import moment from 'moment';

export default class SystemAlertFormComponent extends Component {
  @tracked isLoading = false;

  get alert() {
    return this.args.alert;
  }

  @action
  selectType(type) {
    this.alert.type = type;
  }

  @action
  selectBeginDate(date) {
    this.alert.beginDate = moment(date);
  }

  @action
  selectEndDate(date) {
    this.alert.endDate = moment(date);
  }

  @action
  cancel() {
    this.args.onCancel(...arguments);
  }
}
