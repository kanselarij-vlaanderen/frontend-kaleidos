import Component from '@glimmer/component';

/**
 *
 * @argument {String} status: Status can be "in-progress" (default), "success", "error", "paused"
 */
export default class StatusPill extends Component {
  baseClass = 'auk-status-pill';

  static statusIconMap = {
    'in-progress': [
      'circle',
      'circle-step-1',
      'circle-step-2',
      'circle-step-3',
      'circle-step-4',
      'circle-step-5',
      'circle-step-6',
      'circle-full',
    ],
    success: 'circle-check',
    error: 'circle-x',
    paused: 'circle-pause',
  };
  defaultStatus = 'in-progress';

  get status() {
    return this.args.status || this.defaultStatus;
  }

  get statusClass() {
    return `${this.baseClass}--${this.status}`;
  }

  get iconName() {
    const statusIconMapItem = StatusPill.statusIconMap[this.status];

    if (this.status === 'in-progress') {
      return this.args.step ? statusIconMapItem[this.args.step] : statusIconMapItem[0];
    }
    return statusIconMapItem;
  }

  get sizeClass() {
    if (this.args.size) {
      return `${this.baseClass}--${this.args.size}`;
    }
    return null;
  }

  get actionIconName() {
    return this.args.actionIcon ? this.args.actionIcon : 'pencil';
  }
}
