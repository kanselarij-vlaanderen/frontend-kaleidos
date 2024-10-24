import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class BatchEditingRow extends Component {
  get isDisabled() {
    return this.args.selectedRows.length === 0;
  }

  get isSignMarkingDisabled() {
    for (const row of this.args.selectedRows) {
      if (row.hasSentSignFlow || !!row.signedPiece) {
        return true;
      }
    }
    return false;
  }

  get hasSentSignFlow() {
    return this.args.selectedRows.some((row) => row.hasSentSignFlow);
  }

  get documentType() {
    return this.getBatchSelectedValue((row) => row.documentType);
  }

  get accessLevel() {
    return this.getBatchSelectedValue((row) => row.accessLevel);
  }

  getBatchSelectedValue(getProperty) {
    if (this.args.selectedRows.length === 0) {
      return undefined;
    }

    const selectedRows = this.args.selectedRows;
    const [firstRow, ...otherRows] = selectedRows;
    const firstProperty = getProperty(firstRow);
    const areRowsEqual = otherRows.every(
      (row) => getProperty(row) === firstProperty
    );
    if (!areRowsEqual) {
      return undefined;
    }
    return firstProperty;
  }

  get isToBeDeleted() {
    // some-check: always indicate destructive action will be performed
    return this.args.selectedRows.some((row) => row.isToBeDeleted);
  }

  @action
  setDocumentType(documentType) {
    for (const row of this.args.selectedRows) {
      row.documentType = documentType;
    }
  }

  @action
  setAccessLevel(accessLevel) {
    for (const row of this.args.selectedRows) {
      row.accessLevel = accessLevel;
    }
  }

  @action
  setToBeDeleted(isToBeDeleted) {
    for (const row of this.args.selectedRows) {
      row.isToBeDeleted = isToBeDeleted;
    }
  }

  @action
  setMarkedForSignature(markedForSignature) {
    for (const row of this.args.selectedRows) {
      // don't set flag when a signFlow has been sent to SH (toggle should also be disabled in that case)
      if (!row.signMarkingActivity || row.hasMarkedSignFlow) {
        row.markedForSignature = markedForSignature;
      }
    }
  }
}
