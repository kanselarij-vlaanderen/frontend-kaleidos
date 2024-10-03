import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument status submission status concept
 * @argument meeting optional, what meeting the submission is connected to
 */
export default class CasesSubmissionsStatusPillComponent extends Component {
  @service intl;
  @service store;

  @tracked label;
  @tracked skin = 'ongoing';

  constructor() {
    super(...arguments);
    this.loadStatusText.perform();
  }

  loadStatusText = task(async () => {
    // await promises
    const status = await this.args.status;
    const meeting = await this.args.meeting;
    // show status already
    this.label = status?.label || status?.altLabel;

    // check if submission is on a visible agenda
    if (meeting?.id){
      const agenda = await this.store.queryOne('agenda', {
        'filter[created-for][:id:]':meeting.id,
        sort: '-created', // serialnumber
      });
      if (agenda?.id) {
        // different label and skin when submission is treated on an active agenda
        if (status?.uri === CONSTANTS.SUBMISSION_STATUSES.BEHANDELD) {
          this.label = this.intl.t('on-agenda-status-pill');
          this.skin = "success";
          return;
        }
      }
    }
  });
}
