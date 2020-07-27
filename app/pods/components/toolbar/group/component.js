import Component from '@glimmer/component';

export default class ToolbarGroup extends Component {
  get position() {
    if (this.args.position) {
      return `vlc-toolbar__${this.args.position}`;
    }
    return 'vlc-toolbar__left';
  }
}
