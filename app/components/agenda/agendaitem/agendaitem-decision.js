import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * TODO; subcase/agendaitem arguments are merely used for determining confidentiality of added report file. Simplify this. Maybe just determine subcase from decisionActivity and work from there?
 * @argument subcase; optional
 * @argument agendaitem; optional
 * @argument decisionActivity
 * @argument {Boolean} isTableRow: other layout when in edit mode
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

    let subcaseIsConfidential = false;
    // TODO: determine if this is desired behavior for determining access level
    if (this.args.subcase) {
      subcaseIsConfidential = this.args.subcase.confidential;
    } else if (this.args.agendaitem) {
      const agendaActivity = await this.args.agendaitem.agendaActivity;
      const subcase = await agendaActivity?.subcase;
      subcaseIsConfidential = subcase?.confidential;
    }

    const defaultAccessLevel = await this.store.findRecordByUri(
      'concept', subcaseIsConfidential
        ? CONSTANTS.ACCESS_LEVELS.MINISTERRAAD
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

  @action
  // eslint-disable-next-line no-unused-vars
  async attachPreviousReportVersion(piece) {
    /*
      the deleted piece comes in from params, but not used here because we tracked the previous version.
      Note: this used to be a task but something kept going wrong.
      Trying to get piece.documentContainer after piece was destroyed kept failing after an ember upgrade:
      "Cannot create a new tag for '<(unknown):ember890>' after it has been destroyed"
    */
    if (this.previousReport) {
      this.args.decisionActivity.report = this.previousReport;
      await this.args.decisionActivity.save();
    } // else no previous version available. DecisionActivity no longer has a report
    await this.loadReport.perform();
  }
}
