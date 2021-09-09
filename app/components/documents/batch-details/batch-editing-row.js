import Component from '@glimmer/component';
import { action } from '@ember/object';

// analogous to RowPieceComponent's Row
class BatchRow {
  constructor(selectedRows) {
    this.selectedRows = selectedRows;
  }

  get isDisabled() {
    return this.selectedRows.length > 0;
  }

  get documentType() {
    return this.getBatchSelectedValue((row) => row.documentType);
  }

  get accessLevel() {
    return this.getBatchSelectedValue((row) => row.accessLevel);
  }

  getBatchSelectedValue(getProperty) {
    if (this.selectedRows.length === 0) {
      return undefined;
    }

    const selectedRows = this.selectedRows;
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

  get confidential() {
    const selectedRows = this.selectedRows;
    if (selectedRows.length === 0) {
      return false;
    }
    return selectedRows.every((row) => row.confidential);
  }

  get isToBeDeleted() {
    const selectedRows = this.selectedRows;
    // some-check: always indicate destructive action will be performed
    return selectedRows.some((row) => row.isToBeDeleted);
  }

  @action
  setDocumentType(documentType) {
    const selectedRows = this.selectedRows;
    for (const row of selectedRows) {
      row.documentType = documentType;
    }
  }

  @action
  setAccessLevel(accessLevel) {
    const selectedRows = this.selectedRows;
    for (const row of selectedRows) {
      row.accessLevel = accessLevel;
    }
  }

  @action
  setConfidential(checked) {
    const selectedRows = this.selectedRows;
    for (const row of selectedRows) {
      row.confidential = checked;
    }
  }

  @action
  setToBeDeleted(isToBeDeleted) {
    for (const row of this.selectedRows) {
      row.isToBeDeleted = isToBeDeleted;
    }
  }
}

export default class BatchEditingRow extends Component {
  constructor() {
    super(...arguments);
    this.batch = new BatchRow(this.args.selectedRows);
  }

  @action
  onInputConfidential(event) {
    const checked = event.target.checked;
    this.batch.setConfidential(checked);
  }
}
