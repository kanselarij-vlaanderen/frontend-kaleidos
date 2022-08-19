import Component from '@glimmer/component';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcasesSubcasesProcessComponent extends Component {
  get remarkUri() {
    return CONSTANTS.AGENDA_ITEM_TYPES.REMARK;
  }
}
