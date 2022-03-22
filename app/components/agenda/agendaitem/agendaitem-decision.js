import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;
  @service store;

  @tracked report;
  @tracked previousReport;

  @tracked isEditing = false;
  @tracked isVerifyingDelete = null;
  @tracked isAddingReport = false;
  @tracked treatmentToDelete = null;

  @tracked defaultAccessLevel;
  @tracked decisionDocType;

  constructor() {
    super(...arguments);
    this.loadReport.perform();
    this.loadCodelists.perform();
  }

  @task
  *loadCodelists() {
    this.defaultAccessLevel = yield this.store.findRecordByUri('access-level', CONSTANTS.ACCESS_LEVELS.INTERN_REGERING);
    this.decisionDocType = yield this.store.findRecordByUri('document-type', CONSTANTS.DOCUMENT_TYPES.DECISION);
  }

  @action
  openEditingWindow() {
    this.isEditing = true;
  }

  @action
  closeEditingWindow() {
    this.isEditing = false;
  }

  @action
  toggleIsAddingReport() {
    this.isAddingReport = !this.isAddingReport;
  }

  @action
  promptDeleteTreatment(treatment) {
    this.treatmentToDelete = treatment;
    this.isVerifyingDelete = true;
  }

  @task
  *loadReport() {
    this.report = yield this.args.treatment.report;
    this.previousReport = yield this.report?.previousPiece;
  }

  @action
  async attachReport(piece) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
      type: this.decisionDocType,
    });
    await documentContainer.save();
    piece.setProperties({
      confidential: false,
      accessLevel: this.defaultAccessLevel,
      documentContainer,
    });
    await piece.save();
    this.args.treatment.report = piece;
    await this.args.treatment.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }

  @action
  async attachNewReportVersion(piece) {
    await piece.save();
    this.args.treatment.report = piece;
    await this.args.treatment.save();
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
      this.args.treatment.report = this.previousReport;
      await this.args.treatment.save();
    } // else no previous version available. Treatment no longer has a report
    await this.loadReport.perform();
  }

  @action
  async deleteTreatment() {
    await this.treatmentToDelete.destroyRecord();
    if (this.args.onDeleteTreatment) {
      await this.args.onDeleteTreatment(this.treatmentToDelete);
    }
    this.isVerifyingDelete = false;
  }

  @action
  cancel() {
    this.treatmentToDelete = null;
    this.isVerifyingDelete = false;
  }
}
