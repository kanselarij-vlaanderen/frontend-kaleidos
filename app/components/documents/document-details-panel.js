import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { isPresent } from '@ember/utils';

export default class DocumentsDocumentDetailsPanel extends Component {
  /**
   * @argument piece: a Piece object
   */
   @service currentSession;
   @tracked isEditingDetails = false;
   @tracked isUploadingReplacementFile = false;
   @tracked replacementFile;
   @tracked documentType;
   @tracked accessLevel;

   constructor() {
     super(...arguments);
     this.loadDetailsData.perform();
   }

   get isProcessing() {
     return this.saveDetails.isRunning || this.cancelEditDetails.isRunning;
   }

   @task
   *loadDetailsData() {
     this.documentType = yield this.args.documentContainer.type;
     this.accessLevel = yield this.args.piece.accessLevel;
   }

   @task
   *cancelEditDetails() {
     this.args.piece.rollbackAttributes();
     yield this.loadDetailsData.perform();
     if (this.replacementFile) {
       this.replacementFile.destroyRecord()
       this.replacementFile = undefined;
     }
     this.isEditingDetails = false;
   }

   @task
   *saveDetails() {
     if (this.replacementFile) {
       this.args.piece.file = this.replacementFile;
     }
     this.args.piece.accessLevel = this.accessLevel;
     yield this.args.piece.save();
     this.args.documentContainer.type = this.documentType;
     yield this.args.documentContainer.save();
     this.replacementFile = undefined;
     this.isEditingDetails = false;
   }

   @action
   openEditDetails() {
     this.isEditingDetails = true;
   }

   @action
   setAccessLevel(accessLevel) {
     this.accessLevel = accessLevel;
   }

   @action
   setDocumentType(docType) {
     this.documentType = docType;
   }

   @action
   replaceFile(file) {
     this.replacementFile = file;
     this.isUploadingReplacementFile = false;
   }
}
