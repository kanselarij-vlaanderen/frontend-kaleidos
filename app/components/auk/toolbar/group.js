import Component from '@glimmer/component';

/**
 *
 * @argument {String} position: Position can be "left", "center" or "right"
 * @argument {Boolean} responsive
 */
export default class ToolbarGroup extends Component {
  get position() {
    if (this.args.position) {
      return `auk-toolbar-complex__${this.args.position}`;
    }
    return 'auk-toolbar-complex__left';
  }

  get responsive() {
    if (this.args.responsive) {
      return `auk-toolbar-complex__responsive-item`;
    }
  }
}
