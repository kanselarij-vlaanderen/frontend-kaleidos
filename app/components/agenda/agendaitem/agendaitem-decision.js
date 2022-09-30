import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument decisionActivity
 */
export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;
  @service store;

  @tracked report;
  @tracked previousReport;

  @tracked isEditing = false;
  @tracked isAddingReport = false;

  @tracked decisionDocType;

  constructor() {
    super(...arguments);
    this.loadReport.perform();
    this.loadCodelists.perform();
  }

  @task
  *loadCodelists() {
    this.decisionDocType = yield this.store.findRecordByUri('document-type', CONSTANTS.DOCUMENT_TYPES.DECISION);
  }

  @action
  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  @action
  toggleIsAddingReport() {
    this.isAddingReport = !this.isAddingReport;
  }

  @task
  *loadReport() {
    this.report = yield this.args.decisionActivity.report;
    this.previousReport = yield this.report?.previousPiece;
  }

  @action
  async attachReport(piece) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      type: this.decisionDocType,
    });

    const subcase = await this.args.decisionActivity.subcase;
    const subcaseIsConfidential = subcase?.confidential;

    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept', subcaseIsConfidential
        ? CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK
        : CONSTANTS.ACCESS_LEVELS.INTERN_REGERING
    );

    await documentContainer.save();
    piece.setProperties({
      accessLevel: defaultAccessLevel,
      documentContainer,
    });
    await piece.save();
    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }

  @action
  async attachNewReportVersion(piece) {
    await piece.save();
    this.args.decisionActivity.report = piece;
    await this.args.decisionActivity.save();
    // This reload is a workaround for file-service "deleteDocumentContainer" having a stale list of pieces
    // when deleting the full container right after adding a new report version without the version history open.
    const documentContainer = await piece.documentContainer;
    await documentContainer.hasMany('pieces').reload();
    await this.loadReport.perform();
  }
}
