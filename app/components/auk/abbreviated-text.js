import Component from '@glimmer/component';
import { warn } from '@ember/debug';
import { isNone } from '@ember/utils';

/**
 *
 * @argument text {String}
 * @argument maxLength {Number}
 */
export default class AbbreviatedText extends Component {
  constructor() {
    super(...arguments);
    warn(`Using ${this.constructor.name} while providing a none-like value to @text is pointless.`,
      !isNone(this.args.text),
      {
        id: 'auk.pointless-argument-value',
      }
    );
  }

  get maxLength() {
    // The amount of characters to show in the title.
    return this.args.maxLength || 20;
  }

  get textTooLong() {
    if (this.args.text) {
      return this.args.text.length > this.maxLength;
    }
    return false;
  }

  // Abbreviated version of title.
  get abbreviatedText() {
    return (this.args.text || '').substring(0, this.maxLength);
  }
}
