import Component from '@glimmer/component';
import { action } from '@ember/object';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

export default class PublicationsTableDisplayConfigModalComponent extends Component {
  /**
   * @argument tableConfig: PublicationTableConfig object
   * @argument didChange: action used to notify that tableConfig changed
   * @argument onClose: action, fired when the 'X' is clicked
   */

  get optionColumns() {
    const columnSize = 10; // amount of options per column
    const columns = [];
    for (let i = 0; i < tableColumns.length; i += columnSize) {
      columns.push(tableColumns.slice(i, i + columnSize));
    }
    return columns;
  }

  @action
  toggleColumnVisibility(columnKey, checked) {
    if (checked) {
      this.args.tableConfig.visibleColumnKeys.add(columnKey);
    } else {
      this.args.tableConfig.visibleColumnKeys.delete(columnKey);
    }
    this.args.didChange(this.args.tableConfig);
  }

  @action
  reset() {
    this.args.tableConfig.loadDefault();
    this.args.didChange(this.args.tableConfig);
  }
}
