import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export class Row {
  piece;
  documentContainer;

  @tracked name;
  @tracked documentType;
  @tracked accessLevel;
  @tracked confidential;
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
  setConfidential(confidential) {
    this.confidential = confidential;
  }

  @action
  setToBeDeleted(isToBeDeleted) {
    this.isToBeDeleted = isToBeDeleted;
  }
}

export default class DocumentDetailsRow extends Component {
  @action
  toggleConfidential(event) {
    const confidential = event.target.checked;
    this.args.row.setConfidential(confidential);
  }
}
