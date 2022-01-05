import Component from '@glimmer/component';

/**
 *
 * @argument {String} status: Status can be "in-progress" (default), "not-started", "done", "error"
 */
export default class StatusPillAction extends Component {
  baseClass = 'auk-status-pill';

  static statusIconMap = {
    'in-progress': 'clock',
    'not-started': 'circle',
    'paused': 'circle-pause',
    'neutral': '',
    done: 'circle-check',
    error: 'circle-x',
  };
  defaultStatus = 'in-progress';

  get status() {
    return this.args.status || this.defaultStatus;
  }

  get statusClass() {
    return `${this.baseClass}--${this.status}`;
  }

  get iconName() {
    return StatusPillAction.statusIconMap[this.status];
  }
}
