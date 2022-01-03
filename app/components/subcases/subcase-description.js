import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { action } from '@ember/object';
import { saveChanges } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class SubcaseDescription extends Component {
  @service store;
  @service currentSession;
  @service newsletterService;

  @tracked subcaseName;
  @tracked caseTypes;
  @tracked showAsRemark;
  @tracked caseType;
  @tracked remarkType;

  @tracked latestMeeting;
  @tracked latestAgenda;
  @tracked latestAgendaItem;
  @tracked isRetracted;

  @tracked isEditing = false;
  @tracked isLoading = false;

  constructor() {
    super(...arguments);
    this.subcaseName = this.args.subcase.subcaseName;
    this.showAsRemark = this.args.subcase.showAsRemark;

    this.loadSubcaseDetails.perform();
    this.loadCaseTypes.perform();
    this.loadRemarkType.perform();
  }

  @task
  *loadSubcaseDetails() {
    this.latestMeeting = yield this.args.subcase.requestedForMeeting;
    this.latestAgenda = yield this.store.queryOne('agenda', {
      'filter[created-for][:id:]': this.latestMeeting.id,
      sort: '-created', // serialnumber
    });
    this.latestAgendaItem = yield this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    this.isRetracted = yield this.latestAgendaItem.retracted;
  }

  @task
  *loadRemarkType() {
    let uri = '';
    if (this.showAsRemark) {
      uri = CONSTANTS.CASE_TYPES.REMARK;
    } else {
      uri = CONSTANTS.CASE_TYPES.NOTA;
    }
    this.remarkType = yield this.store.findRecordByUri('case-type', uri);
  }

  @task
  *loadCaseTypes() {
    this.caseTypes = yield this.store.query('case-type', {
      sort: '-label',
      filter: {
        deprecated: false,
      },
    });
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }

  @action
  async cancelEditing() {
    this.isEditing = false;
  }

  @action
  async selectCaseType(type) {
    this.caseType = type;
  }

  @action
  selectRemarkType(event) {
    const id = event.target.value;
    const type = this.store.peekRecord('case-type', id);
    this.showAsRemark = type.get('uri') === CONSTANTS.CASE_TYPES.REMARK;
  }

  @action
  async saveChanges() {
    const resetFormallyOk = true;
    this.isLoading = true;

    const propertiesToSetOnAgendaitem = {
      showAsRemark: this.showAsRemark,
    };

    const propertiesToSetOnSubCase = {
      subcaseName: this.subcaseName,
      type: this.caseType,
      showAsRemark: this.showAsRemark,
    };
    const oldShowAsRemark = this.args.subcase.showAsRemark;
    await saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubCase,
      resetFormallyOk
    );

    if (this.showAsRemark !== oldShowAsRemark) {
      await this.updateNewsletterAfterRemarkChange();
    }

    this.isLoading = false;
    this.isEditing = false;
  }

  async updateNewsletterAfterRemarkChange() {
    const newsletterInfo = await this.store.queryOne('newsletter-info', {
      'filter[agenda-item-treatment][agendaitem][:id:]':
        this.latestAgendaItem.id,
    });
    if (newsletterInfo?.id) {
      await newsletterInfo.deleteRecord();
      console.log('deleted : ' + newsletterInfo);
    }

    if (this.showAsRemark) {
      const newNewsletterInfo =
        await this.newsletterService.createNewsItemForAgendaitem(
          this.latestAgendaItem,
          true
        );
      await newNewsletterInfo.save();
    }
  }
}
