// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import CONSTANTS from 'frontend-kaleidos/config/constants';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  store: service(),

  textToShow: computed('row', 'value', 'row.agendaActivity.subcase', async function() {
    const agendaitem = await this.row;
    const agendaActivity = await agendaitem?.agendaActivity;
    const subcase = await agendaActivity?.subcase;
    let approved = false;

    const meeting = await subcase?.requestedForMeeting;
    if (meeting?.isFinal) {
      const approvedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.GOEDGEKEURD
      );
      const acknowledgedDecisionResultCode = await this.store.findRecordByUri(
        'decision-result-code',
        CONSTANTS.DECISION_RESULT_CODE_URIS.KENNISNAME
      );
      approved = !!(await this.store.queryOne('agenda-item-treatment', {
        'filter[subcase][id]': subcase.id,
        'filter[decision-result-code][:id:]': [
          approvedDecisionResultCode.id,
          acknowledgedDecisionResultCode.id,
        ].join(','),
      }));
    }

    if (approved) {
      return 'Beslist';
    }
    return 'Niet beslist';
  }),
});
