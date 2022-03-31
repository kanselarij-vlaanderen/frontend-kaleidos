import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from '../../config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

/**
 * @argument {Concept} selectedKind The meeting kind to set the dropdown to
 * @argument {function} onChange Action to perform once a meeting kind has been selected
 * @argument {boolean} disabled
 */
export default class UtilsKindSelector extends Component {
  @service store;

  @tracked options;

  constructor() {
    super(...arguments);

    this.loadKinds.perform();
  }

  @task
  *loadKinds() {
    this.options = yield this.store.query('concept', {
      filter: {
        'concept-schemes': {
          ':uri:': CONSTANTS.CONCEPT_SCHEMES.VERGADERACTIVITEIT,
        },
        ':has-no:narrower': true, // Only the most specific concepts, i.e. the actual meeting kinds (so no "Annex")
      },
      include: 'broader,narrower',
      'page[size]': PAGE_SIZE.CODE_LISTS,
      sort: 'position',
    });
  }
}
