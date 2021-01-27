import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import CONFIG from 'fe-redpencil/utils/config';
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
  @tracked checked;

  get mode() {
    if (this.args.mode === 'translation') {
      return true;
    }
    return false;
  }

  constructor() {
    super(...arguments);
    this.fetchClosedStatus();
  }


  async fetchClosedStatus() {
    const closedStatus = await this.store.findRecord('activity-status', CONFIG.ACTIVITY_STATUSSES.closed.id);
    const activityStatus = await this.args.activity.get('status');

    if (activityStatus.id === closedStatus.id) {
      this.checked = true;
    } else {
      this.checked = false;
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
