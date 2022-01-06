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
    'step-1': 'circle-step-1',
    'step-2': 'circle-step-2',
    'step-3': 'circle-step-3',
    'step-4': 'circle-step-4',
    'step-5': 'circle-step-5',
    'step-6': 'circle-step-6',
    'step-7': 'circle-full',
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
