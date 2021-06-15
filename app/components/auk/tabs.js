import Component from '@glimmer/component';

/**
 *
 * @argument {Boolean} reversed
 */
export default class Tabs extends Component {
  get reversed() {
    if (this.args.reversed) {
      return 'auk-tabs--reversed';
    }
    return '';
  }
}
