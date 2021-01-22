import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/*
*  @activity={{activity}}
*  @finishedToggle: function
*  @cancelExisting: function
*  @translation: true/false
 */

export default class ActivityRequestPanel extends Component {
  @tracked isCollapsed = false;

  get mode() {
    if (this.args.mode === 'translation') {
      return true;
    }
    return false;
  }

  @action
  collapsePanel() {
    this.isCollapsed = !this.isCollapsed;
  }

  @action
  async showPieceViewer(piece) {
    window.open(`/document/${(await piece).get('id')}`);
  }
}
