import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SubcaseDescriptionView extends Component {
  /**
   * @argument subcase
   * @argument onClickEdit
   */
  @service store;
  @service currentSession;
  @service subcasesService;

  @tracked phases = null;
  @tracked subcaseType = null;
  @tracked latestMeeting = null;
  @tracked latestAgenda = null;
  @tracked latestAgendaitem = null;
  @tracked approved = null;

  constructor() {
    super(...arguments);
    this.loadAgendaData.perform();
  }

  get showNotYetRequestedMessage() {
    return ![CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING].includes(this.subcaseType?.uri);
  }

  @task
  *loadAgendaData() {
    this.phases = yield this.subcasesService.getSubcasePhases(this.args.subcase);
    this.subcaseType = yield this.args.subcase.type;
    this.latestMeeting = yield this.args.subcase.requestedForMeeting;
    if (this.latestMeeting) {
      this.latestAgenda = yield this.store.queryOne('agenda', {
        'filter[created-for][:id:]': this.latestMeeting.id,
        sort: '-serialnumber',
      });
      this.latestAgendaitem = yield this.store.queryOne('agendaitem', {
        'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
        'filter[:has-no:next-version]': 't',
        sort: '-created',
      });


      if (this.latestMeeting.isFinal) {
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
  }
}
