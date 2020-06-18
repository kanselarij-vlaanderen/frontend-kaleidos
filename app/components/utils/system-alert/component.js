import Component from '@glimmer/component';

export default class extends Component {
  get type() {
    const t = this.args.type;
    if (t === 'Waarschuwing') {
      return 'warning';
    } if (t === 'Dringend') {
      return 'error';
    }
    return null;
  }
}
