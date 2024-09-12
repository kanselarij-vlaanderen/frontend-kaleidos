import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import CONSTANTS from 'frontend-kaleidos/config/constants';

const {
  INGEDIEND,
  IN_BEHANDELING,
  OPNIEUW_INGEDIEND,
  UPDATE_INGEDIEND,
  TERUGGESTUURD,
  BEHANDELD,
  AANPASSING_AANGEVRAAGD,
} = CONSTANTS.SUBMISSION_STATUSES;

export default class SubmissionStatusChangeActivityComponent extends Component {
  @service intl;
  @service currentSession;

  intlKeyMap = {
    [INGEDIEND]: this.args.isHeader ? 'submitted-on-simple' : 'submitted-on',
    [OPNIEUW_INGEDIEND]: 'resubmitted-on',
    [TERUGGESTUURD]: 'sent-back-on',
    [IN_BEHANDELING]: 'in-treatment-by-user-on',
    [UPDATE_INGEDIEND]: this.args.isHeader ? 'update-submitted-on-simple' : 'update-submitted-on',
    [BEHANDELD]: 'treated-on',
    [AANPASSING_AANGEVRAAGD]: 'sent-back-requested-on',
  };

  get label() {
    const activity = this.args.activity;
    const user = activity.belongsTo('startedBy').value();
    const userName = `${user?.firstName} ${user?.lastName}`;
    const startedAt = activity.startedAt;
    const status = activity.belongsTo('status').value(); // Status should be loaded in parent

    if (!activity || !startedAt || !status) return '';

    const date = dateFormat(startedAt, `dd-MM-yyyy`);
    const hour = dateFormat(startedAt, `HH:mm`);
    const canViewComment = this.currentSession.may('create-submissions') || this.currentSession.may('treat-and-accept-submissions');
    const comment = canViewComment && activity.comment ? `: '${activity.comment}'` : '';

    const intlKey = this.intlKeyMap[status.uri];
    // date and hour are not needed for all translations but passing them as params is ok.
    let label = intlKey
      ? this.intl.t(intlKey, { userName, date, hour })
      : '';
    return this.args.isHeader ? label : label + comment;
  }
}
