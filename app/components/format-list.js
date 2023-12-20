import Component from '@glimmer/component';

/**
 * @param {Array} list
 * @param {string} locale
 */
export default class FormatListComponent extends Component {
  get parts() {
    const parts = this.args.list?.slice();
    if (parts) {
      const formatter = new Intl.ListFormat(this.args.locale);
      // Intl.ListFormat#formatToParts (and #format) only accepts strings, if
      // you pass in an object it'll throw a TypeError. This hack with passing
      // in an array of 'thing' strings is there to circumvent this behaviour.
      const formattedParts = formatter.formatToParts(parts.map((_part) => 'thing'));

      let index = 0;
      for (const formattedPart of formattedParts) {
        if (formattedPart.type === 'literal') continue;

        formattedPart.value = parts[index];
        index++;
      }
      return formattedParts;
    }
    return []
  }
}
