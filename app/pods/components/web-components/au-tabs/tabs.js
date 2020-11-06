import Component from '@glimmer/component';

export default class Tabs extends Component {
  get reversed() {
    if (this.args.reversed) {
      return 'auk-tabs--reversed';
    }
    return '';
  }
}
