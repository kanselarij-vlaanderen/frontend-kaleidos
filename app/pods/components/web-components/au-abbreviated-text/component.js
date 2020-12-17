import Component from '@glimmer/component';

export default class AbbreviatedText extends Component {
  // get Text.
  text() {
    return this.args.text;
  }

  // Get Maxsize.
  getMaxSize() {
    // The amount of characters to show in the title.
    return this.args.size || 20;
  }

  // Returns the title.
  get getText() {
    return this.text();
  }

  // Should show ellipsis?
  get textTooLong() {
    return this.text().length > this.getMaxSize();
  }

  // Abbreviated version of title.
  get textAbbreviated() {
    return this.text().substring(0, this.getMaxSize());
  }
}
