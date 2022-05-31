import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument allowEditing
 * @argument onClickEdit
 */
export default class SubcaseTitlesPanelView extends Component {
  @tracked approved;

  constructor() {
    super(...arguments);
    this.loadApproved.perform();
  }

  @task
  *loadApproved() {
    const meeting = yield this.args.subcase.requestedForMeeting;
    if (meeting?.isFinal) {
      const approvedDecisionResultCode = yield this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
      );
      const acknowledgedDecisionResultCode = yield this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
      );
      this.approved = !!(yield this.store.queryOne('agenda-item-treatment', {
        'filter[subcase][id]': this.args.subcase.id,
        'filter[decision-result-code][:id:]': [
          approvedDecisionResultCode.id,
          acknowledgedDecisionResultCode.id,
        ].join(','),
      }));
    } else {
      this.approved = false;
    }
  }

  get pillSkin(){
    if (this.approved) {
      return 'success';
    }
    return 'default';
  }
}
