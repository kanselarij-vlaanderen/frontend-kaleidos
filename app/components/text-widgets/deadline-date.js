import Component from '@glimmer/component';

export default class TextWidgetsDeadlineDateComponent extends Component {
  /**
   * Date with an icon indicating warning
   *
   * @argument date: a JS Date object
   * @argument warningPeriod: duration in seconds relative to the deadline-date from when the warning-icon should be shown (negative before, positive after)
   * @argument errorPeriod: duration in seconds relative to the deadline-date from when the error-icon should be shown (negative before, positive after)
   */
  dateFormat = 'DD-MM-YYYY';

  get useWarning() {
    return Number.isInteger(this.args.warningPeriod);
  }

  get warningIsActive() {
    const warningDate = new Date(this.args.date.getTime()); // clone
    warningDate.setSeconds(warningDate.getSeconds() + this.args.warningPeriod);
    return new Date() > warningDate;
  }

  get useError() {
    return Number.isInteger(this.args.errorPeriod);
  }

  get errorIsActive() {
    const errorDate = new Date(this.args.date.getTime()); // clone
    errorDate.setSeconds(errorDate.getSeconds() + this.args.errorPeriod);
    return new Date() > errorDate;
  }

  get class() {
    if (this.useError && this.errorIsActive) {
      return 'auk-form-help-text--danger';
    } else if (this.useWarning && this.warningIsActive) {
      return 'auk-form-help-text--warning';
    }
    return null;
  }

  get showIcon() {
    return (this.useError && this.errorIsActive) || (this.useWarning && this.warningIsActive);
  }
}
