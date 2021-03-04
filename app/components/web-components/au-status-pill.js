import Component from '@glimmer/component';

export default class StatusPill extends Component {
  get status() {
    if (this.args.status) {
      return `auk-status-pill--${this.args.status}`;
    }
    return 'auk-status-pill--in-progress';
  }
}
