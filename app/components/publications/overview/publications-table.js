import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PublicationsOverviewPublicationsTable extends Component {
  @tracked isColumnsDisplayConfigPanelShown = false;

  @action
  toggleColumnsDisplayConfigPanel() {
    this.isColumnsDisplayConfigPanelShown =
      !this.isColumnsDisplayConfigPanelShown;
  }

  get tableColumnVisibilityMap() {
    const visibilityMap = {};
    for (const key of this.args.tableConfig.allColumnKeys) {
      visibilityMap[key] = this.args.tableConfig.visibleColumnKeys.has(key);
    }
    return visibilityMap;
  }
}
