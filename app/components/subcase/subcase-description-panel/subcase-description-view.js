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
  @service subcaseIsApproved;

  @tracked phases = null;
  @tracked subcaseType = null;
  @tracked latestMeeting = null;
  @tracked latestAgenda = null;
  @tracked latestAgendaitem = null;
  @tracked approved = null;
  @tracked isPostponed = null;
  @tracked isRetracted = null;

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
    this.latestMeeting = yield this.store.queryOne('meeting', {
      'filter[agendas][agendaitems][agenda-activity][subcase][:id:]': this.args.subcase.id,
      sort: '-planned-start',
    });
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
    }
    this.approved = yield this.subcaseIsApproved.isApproved(this.args.subcase);
    if (!this.approved) {
      this.isPostponed = yield this.subcaseIsApproved.isPostponed(this.args.subcase);
      this.isRetracted = yield this.subcaseIsApproved.isRetracted(this.args.subcase);
    }
  }
}
