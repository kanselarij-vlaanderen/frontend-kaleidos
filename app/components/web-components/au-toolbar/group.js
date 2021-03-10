import Component from '@glimmer/component';

export default class ToolbarGroup extends Component {
  get position() {
    if (this.args.position) {
      return `auk-toolbar-complex__${this.args.position}`;
    }
    return 'auk-toolbar-complex__left';
  }
}
