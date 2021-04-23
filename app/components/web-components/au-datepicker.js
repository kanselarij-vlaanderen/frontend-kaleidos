import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Datepicker extends Component {
  get enable() {
    if (this.args.enabledDatesFunction) { // reverse compatibility
      return [this.args.enabledDatesFunction];
    } else if (this.args.enable) { // same interface a flatpickr
      return this.args.enable;
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
  updateEnable() { // in order to make the ember-component work in a DDAU fashion (update view when the enable arg changes)
    this.flatpickrRef.set('enable', this.enable);
  }

  @action
  openDatepicker() {
    this.flatpickrRef.toggle();
  }
}
