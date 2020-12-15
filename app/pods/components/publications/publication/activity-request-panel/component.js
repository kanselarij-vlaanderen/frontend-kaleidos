import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ActivityRequestPanel extends Component {
  @tracked isCollapsed = false;

  @action
  collapsePanel() {
    this.isCollapsed = !this.isCollapsed;
  }

  @action
  async showPieceViewer(piece) {
    window.open(`/document/${(await piece).get('id')}`);
  }
}
