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
  AANVAARD,
} = CONSTANTS.SUBMISSION_STATUSES;

export default class SubmissionStatusChangeActivityComponent extends Component {
  @service intl;

  intlKeyMap = {
    [INGEDIEND]: 'submitted-on',
    [OPNIEUW_INGEDIEND]: 'resubmitted-on',
    [TERUGGESTUURD]: 'sent-back-on',
    [IN_BEHANDELING]: 'in-treatment-by-user-on',
    [UPDATE_INGEDIEND]: 'update-submitted-on',
    [AANVAARD]: 'accepted-on',
  };

  get label() {
    const activity = this.args.activity;
    const startedAt = activity.startedAt;
    const status = activity.belongsTo('status').value(); // Status should be loaded in parent

    if (!activity || !startedAt || !status) return '';

    const date = dateFormat(startedAt, 'dd-MM-yyyy');
    const comment = activity.comment ? `: '${activity.comment}'` : '';

    const intlKey = this.intlKeyMap[status.uri];
    const label = intlKey
      ? this.intl.t(intlKey, { user: this.args.beingTreatedByName, date })
      : '';

    return label + comment;
  }
}
