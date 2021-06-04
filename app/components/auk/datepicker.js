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
    if (this.args.enable) {
      return this.args.enable;
    }
    // Return a function that enables all dates as a default, since passing undefined
    // to <EmberFlatpickr>'s @enable doesn't work
    return [() => true];
  }

  get date() {
    // Return 'null' as a default since <EmberFlatpickr> doesn't handle 'undefined'.
    return this.args.date || null;
  }

  get placeholder() {
    return this.args.placeholder || 'Kies een datum';
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
