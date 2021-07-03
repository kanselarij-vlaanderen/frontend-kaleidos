import Component from '@glimmer/component';

const ICONS = {
  pdf: ['pdf'],
  word: ['doc', 'docx'],
  html: ['htm', 'html'],
};

export default class UtilsDocumentsFileTypePillComponent extends Component {
  get icon() {
    const entry = Object.entries(ICONS).find(([, val]) => val.includes(this.args.extension));
    if (entry) {
      const [icon] = entry;
      return icon;
    }
    return undefined;
  }
}
