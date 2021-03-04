import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONFIG from 'frontend-kaleidos/utils/config';
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
  @tracked finished;

  get isTranslation() {
    return this.args.mode === 'translation';
  }

  constructor() {
    super(...arguments);
    this.fetchClosedStatus();
  }


  async fetchClosedStatus() {
    const closedStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.closed.id);
    const activityStatus = await this.args.activity.get('status');

    if (activityStatus.id === closedStatus.id) {
      this.finished = true;
    } else {
      this.finished = false;
    }
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
