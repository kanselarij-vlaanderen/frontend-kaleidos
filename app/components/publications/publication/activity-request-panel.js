import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/*
*  @activity={{activity}}
*  @finishedToggle: function
*  @cancelExisting: function
*  @translation: true/false
 */

export default class ActivityRequestPanel extends Component {
  @service store;
  @tracked isCollapsed = false;
  @tracked finished; // TODO check if you want/need this or delete

  get isTranslation() {
    return this.args.mode === 'translation';
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
