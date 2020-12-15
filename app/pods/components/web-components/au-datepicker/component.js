import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Datepicker extends Component {
  get enabledDatesFunction() {
    if (this.args.enabledDatesFunction) {
      return [this.args.enabledDatesFunction];
    }
    return null;
  }

  get defaultDate() {
    if (this.args.defaultDate) {
      return this.args.defaultDate;
    }
    return null;
  }

  get placeholder() {
    if (!this.args.placeholder) {
      return 'Kies een datum';
    }
    return this.args.placeholder;
  }

  @action
  // eslint-disable-next-line no-unused-vars
  onReady(_selectedDates, _dateStr, instance) {
    this.flatpickrRef = instance;
  }

  @action
  openDatepicker() {
    this.flatpickrRef.toggle();
  }
}
