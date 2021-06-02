import Component from '@glimmer/component';

/**
 *
 * @argument text {String}
 * @argument maxLength {Number}
 */
export default class AbbreviatedText extends Component {
  get maxLength() {
    // The amount of characters to show in the title.
    return this.args.maxLength || 20;
  }

  get textTooLong() {
    return this.args.text.length > this.maxLength;
  }

  // Abbreviated version of title.
  get abbreviatedText() {
    return this.args.text.substring(0, this.maxLength);
  }
}
