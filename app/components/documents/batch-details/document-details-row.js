import templateOnly from '@ember/component/template-only';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export class Row {
  @service signatureService;

  piece;
  documentContainer;
  showSignature;
  signMarkingActivity;
  hasMarkedSignFlow;
  hasSentSignFlow;

  @tracked name;
  @tracked documentType;
  @tracked accessLevel;
  @tracked markedForSignature = false;
  @tracked isToBeDeleted = false;


  @action
  setDocumentType(documentType) {
    this.documentType = documentType;
  }

  @action
  setAccessLevel(accessLevel) {
    this.accessLevel = accessLevel;
  }

  @action
  setToBeDeleted(isToBeDeleted) {
    this.isToBeDeleted = isToBeDeleted;
  }

  @action
  setMarkedForSignature(markedForSignature) {
    this.markedForSignature = markedForSignature;
  }
}

export default templateOnly();
