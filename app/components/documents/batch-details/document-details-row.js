import templateOnly from '@ember/component/template-only';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export class Row {
  piece;
  documentContainer;
  canBeEditedOrDeleted;

  @tracked name;
  @tracked documentType;
  @tracked accessLevel;
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
}

export default templateOnly();
