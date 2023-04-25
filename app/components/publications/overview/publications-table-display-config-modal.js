import Component from '@glimmer/component';
import { action } from '@ember/object';
import tableColumns from 'frontend-kaleidos/config/publications/overview-table-columns';

export default class PublicationsTableDisplayConfigModalComponent extends Component {
  /**
   * @argument tableConfig: PublicationTableConfig object
   * @argument didChange: action used to notify that tableConfig changed
   * @argument onClose: action, fired when the 'X' is clicked
   */

  get options() {
    return tableColumns;
  }

  get selectedOptions() {
    return this.args.tableConfig.visibleColumns;
  }

  @action
  onChangeOptions(selectedOptions) {
    this.args.tableConfig.visibleColumnKeys = new Set(selectedOptions.map((option) => option.keyName));
    this.args.didChange?.(this.args.tableConfig);
  }

  @action
  reset() {
    this.args.tableConfig.loadDefault();
    this.args.didChange?.(this.args.tableConfig);
  }
}
