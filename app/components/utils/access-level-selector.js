import Component from '@glimmer/component';
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
   */
  get filter() {
    let idFilter = {};
    if (this.args.disableInternSecretarie) {
      idFilter = {
        ':id:': [
          CONSTANTS.ACCESS_LEVEL_IDS.VERTROUWELIJK,
          CONSTANTS.ACCESS_LEVEL_IDS.INTERN_REGERING,
          CONSTANTS.ACCESS_LEVEL_IDS.INTERN_OVERHEID,
          CONSTANTS.ACCESS_LEVEL_IDS.PUBLIEK,
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
}
