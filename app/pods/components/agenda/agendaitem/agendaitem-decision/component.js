import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
// import { A } from '@ember/array';
import { task } from 'ember-concurrency-decorators';
// import { all } from 'ember-concurrency';
import { sortPieces } from 'fe-redpencil/utils/documents';
import CONFIG from 'fe-redpencil/utils/config';

export default class AgendaitemDecisionComponent extends Component {
  @service currentSession;

  @tracked report;

  @tracked isEditing = false;
  @tracked isVerifyingDelete = null;
  @tracked isAddingReport = false;
  @tracked treatmentToDelete = null;

  constructor() {
    super(...arguments);
    this.loadReport.perform();
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

  // @action
  // uploadPiece(file) {
  //   const now = moment().utc()
  //     .toDate();
  //   const documentContainer = this.store.createRecord('document-container', {
  //     created: now,
  //   });
  //   const piece = this.store.createRecord('piece', {
  //     created: now,
  //     modified: now,
  //     file: file,await @treatment
  //     accessLevel: this.defaultAccessLevel,
  //     confidential: false,
  //     name: file.filenameWithoutExtension,
  //     documentContainer: documentContainer,
  //   });
  //   this.newPieces.pushObject(piece);
  // }
  //
  // @task
  // *savePieces() {
  //   const savePromises = this.newPieces.map(async(piece) => {
  //     try {
  //       await this.savePiece.perform(piece);
  //     } catch (error) {
  //       await this.deletePiece.perform(piece);
  //       throw error;
  //     }
  //   });
  //   yield all(savePromises);
  //   yield this.updateRelatedAgendaitemsAndSubcase.perform(this.newPieces);
  //   this.isOpenPieceUploadModal = false;
  //   this.newPieces = A();
  // }
  //
  // /**
  //  * Save a new document container and the piece it wraps
  // */
  // @task
  // *savePiece(piece) {
  //   const documentContainer = yield piece.documentContainer;
  //   yield documentContainer.save();
  //   yield piece.save();
  // }
  //
  /**
   * Add new piece to an existing document container
  */
  @task
  *addPiece(piece) {
    yield piece.save();
    this.args.treatment.set('report', piece);
    yield this.args.treatment.save();
    yield this.loadReport.perform();
  }

  // TODO: rename
  @task
  *didDeletePieceHandler(container) {
    // attach the last of the remaining versions
    console.log("Just deleted piece from container", container);
    let remainingVersions = yield container.pieces;
    if (remainingVersions.length) {
      remainingVersions = remainingVersions.toArray();
      const sortedPieces = sortPieces(remainingVersions);
      this.args.treatment.set('report', sortedPieces[0]);
      yield this.args.treatment.save();
    }
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
