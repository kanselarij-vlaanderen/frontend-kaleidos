import Component from '@glimmer/component';

export default class PublicationsOverviewPublicationsTable extends Component {
  get tableColumnVisibilityMap() {
    const visibilityMap = {};
    for (const key of this.args.tableConfig.allColumnKeys) {
      visibilityMap[key] = this.args.tableConfig.visibleColumnKeys.has(key);
    }
    return visibilityMap;
  }
}
