import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { sortPieces } from 'frontend-kaleidos/utils/documents';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;
  @service store;

  @tracked report;

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
    this.decisionDocType = this.store.peekRecord('document-type', CONFIG.decisionDocumentTypeId);
    if (!this.decisionDocType) {
      const docTypes = yield this.store.query('document-type', {
        'page[size]': 1,
        'filter[:id:]': CONFIG.decisionDocumentTypeId,
      });
      this.decisionDocType = docTypes.firstObject;
    }
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
    this.args.treatment.set('report', piece);
    this.args.treatment.save();
    this.isAddingReport = false;
    await this.loadReport.perform();
  }

  @task
  *attachNewReportVersion(piece) {
    yield piece.save();
    this.args.treatment.set('report', piece);
    yield this.args.treatment.save();
    yield this.loadReport.perform();
  }

  @task
  *attachPreviousReportVersion(piece) {
    // TODO: Assess if we need to go over container. `previousVersion` (if existant) might suffice?
    const container = yield piece.documentContainer;
    let remainingVersions = yield container.pieces;
    if (remainingVersions.length) {
      remainingVersions = remainingVersions.toArray();
      const sortedPieces = sortPieces(remainingVersions);
      this.args.treatment.set('report', sortedPieces[0]);
      yield this.args.treatment.save();
    } // else no previous version available. Treatment no longer has a report
    yield this.loadReport.perform();
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
