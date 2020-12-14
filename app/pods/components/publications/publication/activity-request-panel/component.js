import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ActivityRequestPanel extends Component {
  @tracked panelCollapsed = false;

  @action
  collapsePanel() {
    this.panelCollapsed = !this.panelCollapsed;
  }

  @action
  async showPieceViewer(piece) {
    window.open(`/document/${(await piece).get('id')}`);
  }
}
