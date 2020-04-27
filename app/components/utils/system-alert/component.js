import Component from '@glimmer/component';

export default class extends Component {
  get type () {
    const t = this.args.type;
    if (t === 'Waarschuwing') {
      return 'warning';
    } else if (t === 'Dringend') {
      return 'error';
    } else {
      return null;
    }
  }
}
