import Component from '@glimmer/component';

export default class Textarea extends Component {
  static DEFAULT_ROWS = 2;

  get amountOfRows() {
    if (this.args.rows) {
      return `${this.args.rows}`;
    }
    return Textarea.DEFAULT_ROWS;
  }

  get getResizeClass() {
    if (this.args.resize === 'vertical') {
      return 'auk-textarea--resize-vertical';
    }
    return null;
  }
}
