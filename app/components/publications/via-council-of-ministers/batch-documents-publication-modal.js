import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';
import muSearch from 'frontend-kaleidos/utils/mu-search';
/**
 * @argument {Agendaitem} agedaitem
 */
export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  @inject store;
  @inject intl;
  @inject publicationService;

  publicationFlowDefaultOptionsTask;
  referenceDocument;

  @tracked isOpenNewPublicationModal = false;
  @lastValue('loadPieces') pieces;
  @lastValue('loadCase') case;

  constructor() {
    super(...arguments);

    this.loadPieces.perform();
    this.loadCase.perform();
    this.publicationFlowLinkOptions = [{
      value: false,
      label: this.intl.t('none'),
    }, {
      value: true,
      label: this.intl.t('existing'),
    }];
    this.publicationFlowDefaultOptionsTask = this.searchPublicationFlow.perform();
  }

  @task
  *loadPieces() {
    // ensure all related records are loaded to prevent extra calls from template for each piece individually
    yield this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      'page[size]': this.args.pieces.length,
      include: 'document-container,document-container.type,file,publication-flow,publication-flow.identification',
    });
  }

  @task
  // no yield but use of task for @lastValue
  // eslint-disable-next-line require-yield
  *loadCase() {
    return this.store.queryOne('case', {
      'filter[subcases][agenda-activities][agendaitems][:id:]': this.args.agendaitem.id,
    });
  }

  @action
  changeLinkStatus() {

  }

  // new publication actions
  @action
  async openNewPublicationModal(piece) {
    this.referenceDocument = piece;
    this.isOpenNewPublicationModal = true;
  }

  @task
  *saveNewPublication(publicationProperties) {
    const publicationFlow = yield this.publicationService.createNewPublicationFromMinisterialCouncil(publicationProperties, {
      // case should already be loaded here
      case: this.case,
    });
    this.referenceDocument.publicationFlow = publicationFlow;
    yield this.referenceDocument.save();
    this.isOpenNewPublicationModal = false;
  }

  @action
  cancelNewPublication() {
    this.isOpenNewPublicationModal = false;
  }

  // select existing publication actions
  @action
  searchPublicationFlowWithCache(identification) {
    if (!identification) {
      return this.publicationFlowDefaultOptionsTask;
    }
    return this.loadPublicationFlowIdentifications.perform(identification);
  }

  @task
  *searchPublicationFlow(searchText) {
    let filterIdName = {};
    // if (identification) {
    //   console.log(identification)
    //   filterIdName = {
    //     // 'filter[id-name]': identification,
    //     'filter[:lte,gte:id-name]': [identification, identification + 'z'].join(',')
    //   };
    // }

    if (searchText) {
      filterIdName = {
        // 'filter[id-name]': identification,
        ':phrase_prefix:id-name': searchText,
      };
    }
    // filterIdName[':has:publication-flow'] = true;

    // index, page, size, sort, filter, dataMapping

    // const identifications = muSearch('identifications', 0, 10, 'id-name', filterIdName, (item) => {
    //   const entry = item.attributes;
    //   entry.id = item.id;
    //   return entry;
    // });

    // TRY 4 search publication flows
    if (searchText) {
      filterIdName = {
        // 'filter[id-name]': identification,
        'identification[:phrase_prefix:id-name]': searchText,
      };
    }
    // filterIdName[':has:publication-flow'] = true;

    // index, page, size, sort, filter, dataMapping

    const searchResults = yield muSearch('publication-flows', 0, 10, null, filterIdName, (it) => Object.assign(it.attributes, {
      id: it.id,
    }));
    console.log(searchResults);
    // let identifications = yield this.store.query('identification', {
    //   filter: filterIdName,

    //   'page[size]': 10,
    // });

    // let identifications = yield this.store.query('identification', {
    //   ...filterIdName,
    //   'filter[:has:publication-flow]': true,
    //   'page[size]': 10,
    // });
    // identifications = identifications.toArray();

    return searchResults;
  }

  @action
  async selectPublicationFlow(piece, searchPublicationFlow) {
    const publicationFlow = await this.store.findRecord('publication-flow', searchPublicationFlow.id);
    piece.publicationFlow = publicationFlow;
    await piece.save();
  }
}
