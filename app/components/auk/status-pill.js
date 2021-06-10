import Component from '@glimmer/component';

/**
 *
 * @argument {String} status: Status can be "in-progress" (default), "not-started", "done", "error"
 */
export default class StatusPill extends Component {
  baseClass = 'auk-status-pill';

  static statusIconMap = {
    'in-progress': 'clock',
    'not-started': 'not-started',
    done: 'circle-check',
    error: 'circle-error',
  };
  defaultStatus = 'in-progress';

  get status() {
    return this.args.status || this.defaultStatus;
  }

  get statusClass() {
    return `${this.baseClass}--${this.status}`;
  }

  get iconName() {
    return StatusPill.statusIconMap[this.status];
  }
}
