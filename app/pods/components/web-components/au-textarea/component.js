import Component from '@glimmer/component';

const DEFAULT_ROWS = 2;

export default class Textarea extends Component {
  get getRows() {
    if (this.args.rows) {
      return `${this.args.rows}`;
    }
    return DEFAULT_ROWS;
  }

  get getResizeClass() {
    if (this.args.resize === 'vertical') {
      return 'auk-textarea--resize-vertical';
    }
    return null;
  }
}
