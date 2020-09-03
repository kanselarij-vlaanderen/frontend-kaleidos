import Component from '@glimmer/component';

export default class StatusPill extends Component {
  get status() {
    if (this.args.status) {
      return this.args.status;
    }

    return 'not-started';
  }
}
