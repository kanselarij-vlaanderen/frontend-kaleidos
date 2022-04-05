import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { timeout, restartableTask } from 'ember-concurrency';
import { isBlank } from '@ember/utils';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';

/**
 * @argument {PublicationFlow} selected
 * @argument {Case} case
 * @argument {(publicationFlow: { id: string, identification: string }) => void} onChange
 */
export default class PublicationsPublicationFlowSelectorComponent extends Component {
  @service store;

  @restartableTask
  *debouncedSearch(searchText) {
    yield timeout(300);

    const filter = {
      // multiple reference documents on 1 publication-flow must belong to the same case
      case: {
        ':id:': this.args.case.get('id'),
      },
    };
    if (!isBlank(searchText)) {
      filter.identification = {
        'id-name': searchText,
      };
    }
    const publicationFlows = yield this.store.query('publication-flow', {
      filter,
      'page[size]': PAGE_SIZE.PUBLICATION_FLOWS,
      sort: 'identification.id-name',
      include: 'identification',
    });
    return publicationFlows;
  }
}
