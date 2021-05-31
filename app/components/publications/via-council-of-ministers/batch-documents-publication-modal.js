import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import muSearch from 'frontend-kaleidos/utils/mu-search';
/**
 * @argument {Agendaitem} agedaitem
 */
export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  publicationFlowDefaultOptionsTask;
  pieceToPublish;

  @tracked isOpenNewPublicationModal = false;
  @lastValue('loadPieces') pieces;
  @lastValue('loadCase') case;

  @inject store;
  @inject publicationService;

  constructor() {
    super(...arguments);

    this.loadPieces.perform();
    this.loadCase.perform();
    this.publicationFlowDefaultOptionsTask = this.loadPublicationFlowIdentifications.perform();
  }

  @task
  *loadPieces() {
    // query: ensure all related records are loaded (to prevent extra calls from template)
    let pieces = yield this.store.query('piece', {
      'filter[agendaitems][:id:]': this.args.agendaitem.id,
      'page[size]': 500, // TODO add pagination when sorting is done in the backend
      include: 'document-container,document-container.type,file,publication-flow,publication-flow.identification',
    });
    // array: <DocumentList /> expects array
    pieces = pieces.toArray();
    pieces = sortPieces(pieces);
    return pieces;
  }

  @task
  // no yield but use of task for @lastValue
  // eslint-disable-next-line require-yield
  *loadCase() {
    return this.store.queryOne('case', {
      'filter[subcases][agenda-activities][agendaitems][:id:]': this.args.agendaitem.id,
    });
  }

  // new publication actions
  @action
  async openNewPublicationModal(piece) {
    this.pieceToPublish = piece;
    this.isOpenNewPublicationModal = true;
  }

  @task
  *saveNewPublication(publicationProperties) {
    const publicationFlow = yield this.publicationService.createNewPublicationFromMinisterialCouncil(publicationProperties, {
      // case should already be loaded here
      case: this.case,
    });
    this.pieceToPublish.publicationFlow = publicationFlow;
    yield this.pieceToPublish.save();
    this.isOpenNewPublicationModal = false;
  }

  @action
  cancelNewPublication() {
    this.isOpenNewPublicationModal = false;
  }

  // select existing publication actions
  @action
  loadPublicationFlowIdentificationsWithCache(identification) {
    if (!identification) {
      return this.publicationFlowDefaultOptionsTask;
    }
    return this.loadPublicationFlowIdentifications.perform(identification);
  }

  @task
  *loadPublicationFlowIdentifications(identification) {
    let filterIdName = {};
    // if (identification) {
    //   console.log(identification)
    //   filterIdName = {
    //     // 'filter[id-name]': identification,
    //     'filter[:lte,gte:id-name]': [identification, identification + 'z'].join(',')
    //   };
    // }

    if (identification) {
      console.log(identification)
      filterIdName = {
        // 'filter[id-name]': identification,
        ':phrase_prefix:id-name': identification,
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
    if (identification) {
      console.log(identification)
      filterIdName = {
        // 'filter[id-name]': identification,
        'identification[:phrase_prefix:id-name]': identification,
      };
    }
    // filterIdName[':has:publication-flow'] = true;

    // index, page, size, sort, filter, dataMapping

    const identifications = muSearch('publication-flows', 0, 10, null, filterIdName, (item) => {
      const entry = item.attributes;
      entry.id = item.id;
      return entry;
    });

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

    return identifications;
  }

  @action
  async selectPublicationFlow(piece, identification) {
    console.log(piece, identification);
    piece.publicationFlow = await identification.publicationFlow;
    await piece.save();
  }
}
