import Component from '@glimmer/component';

/**
 * Auk wrapper for Textarea. Takes all arguments that <Textarea> takes, plus a couple of extras.
 *
 * @argument {Number} rows: Amount of rows to show by default
 * @argument {String} resize: "horizontal" (default) or "vertical"
 */
export default class Textarea extends Component {
  static DEFAULT_ROWS = 2;

  get amountOfRows() {
    if (this.args.rows) {
      return `${this.args.rows}`;
    }
    return Textarea.DEFAULT_ROWS;
  }

  get resizeClass() {
    if (this.args.resize === 'vertical') {
      return 'auk-textarea--resize-vertical';
    }
    return null;
  }
}
