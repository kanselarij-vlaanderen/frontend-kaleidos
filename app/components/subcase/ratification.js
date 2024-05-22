import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debounce } from '@ember/runloop';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument decisionActivity (needed for marking for signing only when on agendaitem view)
 */
export default class SubcaseRatificationComponent extends Component {
  @service store;
  @service toaster;
  @service intl;
  @service pieceAccessLevelService;
  @service fileConversionService;

  @tracked isAddingRatification = false;
  @tracked ratification;
  @tracked ratifiedBy;
  @tracked disableMandateeSelectorPanel = true;
  @tracked showMandateeSelectorPanel = false;

  constructor() {
    super(...arguments);
    this.initialLoad.perform();
    this.mandateeSelectorPanelTitle = this.intl.t('ratifying-mandatees');
    this.showMandateeSelectorPanel = true;
  }

  initialLoad = task(async () => {
    await this.loadRatification.perform();
    await this.loadCodelists.perform();
  });

  loadRatification = task(async () => {
    this.disableMandateeSelectorPanel = true;
    this.ratification = await this.args.subcase.belongsTo('ratification').reload();
    this.ratifiedBy = await this.args.subcase.hasMany('ratifiedBy').reload();
    this.disableMandateeSelectorPanel = false;
  });

  loadCodelists = task(async () => {
    this.ratificationDocType = await this.store.findRecordByUri(
      'concept',
      CONSTANTS.DOCUMENT_TYPES.BEKRACHTIGING
    );
  });

  @action
  async attachNewRatificationVersionAsPiece(piece) {
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title')
      );
    }
    this.args.subcase.ratification = piece;
    await this.args.subcase.save();

    // This should happen in document-card but isn't reached.
    await this.pieceAccessLevelService.updatePreviousAccessLevel(piece);

    // This reload is a workaround for file-service "deleteDocumentContainer" having a stale list of pieces
    // when deleting the full container right after adding a new report version without the version history open.
    const documentContainer = await piece.documentContainer;
    await documentContainer.hasMany('pieces').reload();
    await this.loadRatification.perform();
  }

  @action
  async didDeleteRatification() {
    await this.loadRatification.perform();
  }

  @action
  async attachRatificationPdf(piece) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      type: this.ratificationDocType,
    });

    const subcase = await this.args.subcase;
    const subcaseIsConfidential = subcase?.confidential;

    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept',
      subcaseIsConfidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID
    );

    await documentContainer.save();
    piece.setProperties({
      accessLevel: defaultAccessLevel,
      documentContainer,
    });
    await piece.save();
    try {
      const sourceFile = await piece.file;
      await this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error?.message }),
        this.intl.t('warning-title')
      );
    }
    this.args.subcase.ratification = piece;
    await this.args.subcase.save();
    this.isAddingRatification = false;
    await this.loadRatification.perform();
  }

  @action
  async setMandatees(mandatees) {
    // the mandatee selector panel calls this on rendering
    // we only want to save when the list has actually changed
    const sameElements =
      mandatees?.length == this.ratifiedBy?.length &&
      this.ratifiedBy?.every((mandatee) =>
        mandatees?.map((x) => x.id).includes(mandatee.id)
      );
    if (!sameElements) {
      this.ratifiedBy = mandatees;
      debounce(this, this.saveRatifiedBy, 1000);
    }
  }

  async saveRatifiedBy() {
    this.disableMandateeSelectorPanel = true;
    this.args.subcase.ratifiedBy = this.ratifiedBy;
    await this.args.subcase.save();
    await this.loadRatification.perform();
    this.disableMandateeSelectorPanel = false;
  }
}
