import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from '../../config/constants';

export default class UtilsAccessLevelSelectorComponent extends Component {
  /**
   * @argument field
   * @argument searchField
   * @argument sortField
   * @argument displayField
   * @argument includeField
   * @argument placeholder
   * @argument disabled
   * @argument allowClear
   * @argument multiple
   * @argument selected
   * @argument onChange
   * @argument filterOptions: a function that will filter out results from the dropwdown menu
   * @argument simplifiedOptions: if true, only show Vertrouwelijk and Intern Regering
   */

  @service store;

  get confidentialUri() {
    return CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK;
  }

  get filter() {
    let idFilter = {};
    if (this.args.simplifiedOptions) {
      idFilter = {
        ':id:': [
          CONSTANTS.ACCESS_LEVEL_IDS.VERTROUWELIJK,
          CONSTANTS.ACCESS_LEVEL_IDS.INTERN_REGERING,
        ].join(',')
      }
    }
    return {
      'concept-schemes': {
        ':uri:': CONSTANTS.CONCEPT_SCHEMES.ACCESS_LEVELS,
      },
      ...idFilter
    }
  }

  toggleConfidential = async (isConfidential) => {
    const confidential = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK);
    const internRegering = await this.store.findRecordByUri('concept', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);

    const accessLevel = isConfidential ? confidential : internRegering;

    this.args.onChange?.(accessLevel);
  }
}
