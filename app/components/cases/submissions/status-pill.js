import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument status submission status concept
 * @argument submission optional, if present it will be used to check if an approved agenda is linked
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
    // show status already
    this.label = status?.label || status?.altLabel;
    // check if submission is on a visible agenda
    if (this.args.submission?.id) {
      const agenda = await this.store.queryOne('agenda', {
        'filter[agendaitems][pieces][draft-piece][submission][:id:]': this.args.submission.id,
        'filter[status][:uri:]': CONSTANTS.AGENDA_STATUSSES.APPROVED,
        sort: '-created', // serialnumber
      });
      if (agenda?.id) {
        // different label and skin when submission is treated on an active agenda
        if (status?.uri === CONSTANTS.SUBMISSION_STATUSES.BEHANDELD) {
          this.label = this.intl.t('on-agenda-status-pill');
          this.skin = 'success';
          return;
        }
      }
    }
  });
}
