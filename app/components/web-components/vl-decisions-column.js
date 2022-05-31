import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class WebComponentsVlDecisionsColumn extends Component {
  @service store;

  @tracked textToShow;

  constructor() {
    super(...arguments);

    this.loadTextToShow.perform();
  }

  @task
  *loadTextToShow() {
    const agendaitem = yield this.row;
    const agendaActivity = yield agendaitem?.agendaActivity;
    const subcase = yield agendaActivity?.subcase;
    let approved = false;

    const meeting = yield subcase?.requestedForMeeting;
    if (meeting?.isFinal) {
      const approvedDecisionResultCode = yield this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
      );
      const acknowledgedDecisionResultCode = yield this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
      );
      approved = !!(yield this.store.queryOne('agenda-item-treatment', {
        'filter[subcase][id]': subcase.id,
        'filter[decision-result-code][:id:]': [
          approvedDecisionResultCode.id,
          acknowledgedDecisionResultCode.id,
        ].join(','),
      }));
    }

    if (approved) {
      this.textToShow = 'Beslist';
    }
    this.textToShow = 'Niet beslist';
  }
}
