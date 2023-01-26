import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class SystemAlertFormComponent extends Component {
  @tracked isLoading = false;

  get alert() {
    return this.args.alert;
  }

  get beginDate() {
    return this.alert.beginDate;
  }

  get endDate() {
    return this.alert.endDate;
  }

  @action
  selectType(type) {
    this.alert.type = type;
  }

  @action
  selectBeginDate(date) {
    this.alert.beginDate = date;
  }

  @action
  selectEndDate(date) {
    this.alert.endDate = date;
  }

  @action
  cancel() {
    this.args.onCancel(...arguments);
  }
}
