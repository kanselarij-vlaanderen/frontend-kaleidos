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
