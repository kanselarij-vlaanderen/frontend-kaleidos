import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import moment from 'moment';

export default class SystemAlertFormComponent extends Component {
  @tracked isLoading = false;

  get alert() {
    return this.args.alert;
  }

  get beginDate() {
    const beginDate = this.alert.beginDate;
    return moment.isMoment(beginDate) ? moment(beginDate).toDate() : beginDate;
  }

  get endDate() {
    const endDate = this.alert.endDate;
    return moment.isMoment(endDate) ? moment(endDate).toDate() : endDate;
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
