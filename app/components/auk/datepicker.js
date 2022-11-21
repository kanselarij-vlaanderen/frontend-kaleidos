import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

/**
 * Kaleidos-styled wrapper for EmberFlatpickr. Takes the same arguments as EmberFlatpickr takes.
 */

/**
 *
 * @argument {String} placeholder. Determines the input placeholder (defaults to 'Kies een datum')
 * @argument {Boolean} multiple. Determines if multiple dates can be selected
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

  get multiple() {
    return this.args.multiple || false;
  }

  get mode() {
    return this.multiple ? 'multiple' : 'single';
  }

  get error() {
    if (this.args.error) {
      return 'auk-input--error';
    }
    return null;
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
  // eslint-disable-next-line no-unused-vars
  onChange(selectedDates, _dateStr, _instance) {
    if (isPresent(this.args.onChange)) {
      return this.args.onChange(this.multiple ? selectedDates : selectedDates[0]);
    }
    // Return 'null' as a default since <EmberFlatpickr> doesn't handle 'undefined'.
    return null;
  }
}
