import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentDetailsPanel extends Component {
  /**
   * @argument piece: a Piece object
   */
   @service currentSession;
   @tracked isEditingDetails = false;
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
     this.args.piece.rollbackAttributes(); // in case of piece name change
     yield this.loadDetailsData.perform();
     this.isEditingDetails = false;
   }

   @task
   *saveDetails() {
     this.args.piece.accessLevel = this.accessLevel;
     yield this.args.piece.save();
     this.args.documentContainer.type = this.documentType;
     yield this.args.documentContainer.save();
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
}
