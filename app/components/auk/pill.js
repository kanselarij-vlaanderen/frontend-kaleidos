import Component from '@glimmer/component';

/**
 *
 * @argument {String} skin: possible values are (empty, default), "white", "success", "danger", "warning"
 * @argumemt {String} layout: possible values are (empty, default is "icon-left"), "icon-only", "icon-right"
 * @argument {String} icon: name of the icon to render
 */
export default class Pill extends Component {
  get skin() {
    if (this.args.skin) {
      return `auk-pill--${this.args.skin}`;
    }
    return 'auk-pill--default';
  }

  get layout() {
    if (this.args.layout) {
      return `auk-pill--${this.args.layout}`;
    }
    return '';
  }
}
