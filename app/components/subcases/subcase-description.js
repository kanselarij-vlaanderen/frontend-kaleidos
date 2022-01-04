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
  @tracked subcaseType;
  @tracked caseType;
  @tracked showAsRemark;

  @tracked latestMeeting;
  @tracked latestAgenda;
  @tracked latestAgendaItem;

  @tracked isEditing = false;
  @tracked isLoading = false;

  constructor() {
    super(...arguments);
    this.showAsRemark = this.args.subcase.showAsRemark;
    this.subcaseName = this.args.subcase.subcaseName ;
    this.loadSubcaseDetails.perform();
    this.loadSubcaseType.perform();
    this.loadCaseTypes.perform();
    this.loadCaseType.perform();
  }

  @task
  *loadSubcaseDetails() {
    this.latestMeeting = yield this.args.subcase.requestedForMeeting;
    this.latestAgenda = yield this.store.queryOne('agenda', {
      'filter[created-for][:id:]': this.latestMeeting.id,
      sort: '-created', // serialnumber
    });
    this.latestAgendaItem = yield this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
  }

  @task
  *loadCaseType() {
    let uri = '';
    if (this.showAsRemark) {
      uri = CONSTANTS.CASE_TYPES.REMARK;
    } else {
      uri = CONSTANTS.CASE_TYPES.NOTA;
    }
    this.caseType = yield this.store.findRecordByUri('case-type', uri);
    console.log(this.caseType)
  }

  @task
  *loadSubcaseType() {
    this.subcaseType = yield this.args.subcase.type;
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
  async selectSubcaseType(type) {
    this.subcaseType = type;
    this.subcaseName = type.label;
  }

  @action
  selectCaseType(event) {
    const id = event.target.value;
    this.caseType = this.store.peekRecord('case-type', id);

    this.showAsRemark = this.caseType.get('uri') === CONSTANTS.CASE_TYPES.REMARK;
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
      type: this.subcaseType,
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
