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

    // Filter on all publication-flows linked to the same case
    // because multiple reference documents on 1 publication-flow must belong to the same case
    const filterByCase = {
      case: {
        ':id:': this.args.case.get('id'),
      },
    };

    // Filter on all publication-flows 'niet via MR'
    // to support relinking a publication-flow that was created before
    // the (sub)case was handled on an agenda
    const filterNotViaCouncilOfMinisters = {
      'decision-activity': {
        'treatment': {
          ':has-no:agendaitems': 'yes',
        },
      },
    };

    if (!isBlank(searchText)) {
      [filterByCase, filterNotViaCouncilOfMinisters].forEach((filter) => {
          filter.identification = {
            'id-name': searchText,
          };
      });
    }

    // We need to do both queries seperately and combine the results afterwards,
    // since multiple filters can not be combined using 'OR' in mu-cl-resources
    const searchByCase = this.store.query('publication-flow', {
      filter: filterByCase,
      'page[size]': PAGE_SIZE.PUBLICATION_FLOWS,
      sort: 'identification.id-name',
      include: 'identification',
    });
    const searchNotViaCouncilOfMinisters = this.store.query('publication-flow', {
      filter: filterNotViaCouncilOfMinisters,
      'page[size]': PAGE_SIZE.PUBLICATION_FLOWS,
      sort: 'identification.id-name',
      include: 'identification',
    });

    const [publicationsByCase, publicationsNotViaCouncilOfMinisters] = yield Promise.all([
      searchByCase,
      searchNotViaCouncilOfMinisters
    ]);

    return [
      ...publicationsByCase.toArray(),
      ...publicationsNotViaCouncilOfMinisters.toArray()
    ];
  }
}
