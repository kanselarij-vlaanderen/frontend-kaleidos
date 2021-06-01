import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  task,
  lastValue
} from 'ember-concurrency-decorators';

class PieceRow {
  linkModeOptions;

  constructor(piece, linkMode) {
    this.piece = piece;
    this.linkMode = linkMode;
  }

  @tracked piece;
  @tracked linkMode;

  get isInLinkMode() {
    return this.linkMode.value;
  }
}

/**
 * @argument {Agendaitem} agedaitem
 * @argument {Piece[]} pieces
 */
export default class PublicationsBatchDocumentsPublicationModalComponent extends Component {
  @inject store;
  @inject intl;
  @inject publicationService;

  linkModeOptions;
  newPublicationRow;

  @tracked rows;
  @tracked isOpenNewPublicationModal = false;
  @lastValue('loadCase') case;

  constructor() {
    super(...arguments);

    this.initLinkModeOptions();
    this.loadPieces.perform().then(() => this.initRows(this.args.pieces));
    this.loadCase.perform();
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

  async initRows(pieces) {
    const latestPieces = this.extractLatestVersions(pieces);
    this.rows = await Promise.all(latestPieces.map(async(piece) => {
      // can only resolve to null when awaited
      const publicationFlow = await piece.publicationFlow;
      const isInLinkMode = !!publicationFlow;
      const linkMode = this.getLinkMode(isInLinkMode);
      return new PieceRow(piece, linkMode);
    }));
  }

  extractLatestVersions(pieces) {
    const documentsByContainer = {};
    for (const piece of pieces) {
      const container = piece.documentContainer;
      const containerId = container.get('id');
      const firstContainer = documentsByContainer[containerId];
      if (!firstContainer) {
        documentsByContainer[containerId] = piece;
      }
    }

    return Object.values(documentsByContainer);
  }

  @task
  // no yield but use of task for @lastValue
  // eslint-disable-next-line require-yield
  *loadCase() {
    return this.store.queryOne('case', {
      'filter[subcases][agenda-activities][agendaitems][:id:]': this.args.agendaitem.id,
    });
  }

  // SECTION: LINK MODE
  initLinkModeOptions() {
    this.linkModeOptions = [{
      value: false,
      label: this.intl.t('none'),
    }, {
      value: true,
      label: this.intl.t('existing'),
    }];
  }

  getLinkMode(selection) {
    return this.linkModeOptions.find((option) => option.value === selection);
  }

  @action
  changeLinkMode(row, selection) {
    row.linkMode = selection;

    if (!row.isInLinkMode) {
      const piece = row.piece;
      piece.publicationFlow = undefined;
      piece.save();
    }
  }

  // SECTION: NEW PUBLICATION FLOW
  @action
  async openNewPublicationModal(row) {
    this.newPublicationRow = row;
    this.isOpenNewPublicationModal = true;
  }

  @task
  *saveNewPublication(publicationProperties) {
    const publicationFlow = yield this.publicationService.createNewPublicationFromMinisterialCouncil(publicationProperties, {
      case: this.case,
    });
    const piece = this.newPublicationRow.piece;
    piece.publicationFlow = publicationFlow;
    yield piece.save();
    this.newPublicationRow.linkMode = this.getLinkMode(true);
    this.isOpenNewPublicationModal = false;
  }

  @action
  cancelNewPublication() {
    this.isOpenNewPublicationModal = false;
  }

  // SECTION: EXISTING PUBLICATION FLOW
  @action
  async selectPublicationFlow(row, publicationFlow) {
    const piece = row.piece;
    piece.publicationFlow = publicationFlow;
    await piece.save();
  }
}
