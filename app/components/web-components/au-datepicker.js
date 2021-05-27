import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * @argument enable choose selectability of specific dates in the calendar popup
 * @argument {boolean} disabled disable the component entirely
 * @argument defaultDate
 * @argument placeholder
 * @argument class css classes
 * @argument onChange
 */
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

  get showExpired() {
    if (this.args.showExpired && this.args.defaultDate) {
      // TODO comparing dates doesnt work too well with datetime. today is already expired
      return this.args.defaultDate < new Date();
    }
    return false;
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
