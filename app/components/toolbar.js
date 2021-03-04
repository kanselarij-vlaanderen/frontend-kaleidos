import Component from '@glimmer/component';

export default class Toolbar extends Component {
  get auto() {
    if (this.args.auto) {
      return 'vlc-toolbar--auto';
    }
    return '';
  }
}
