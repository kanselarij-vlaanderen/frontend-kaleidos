import Component from '@glimmer/component';

export default class Toolbar extends Component {
  get auto() {
    if (this.args.auto) {
      return 'auk-toolbar-complex--auto';
    }
    return '';
  }
}
