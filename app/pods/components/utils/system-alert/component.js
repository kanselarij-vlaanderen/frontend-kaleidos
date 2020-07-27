import Component from '@glimmer/component';

export default class extends Component {
  get type() {
    const currentType = this.args.type;
    if (currentType === 'Waarschuwing') {
      return 'warning';
    } if (currentType === 'Dringend') {
      return 'error';
    }
    return null;
  }
}
