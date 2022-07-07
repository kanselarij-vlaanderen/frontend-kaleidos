import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';

export default class SubcaseDescriptionEdit extends Component {
  /**
   * @argument subcase
   * @argument onCancel
   * @argument onSave
   */
  @service store;
  @service newsletterService;
  @service agendaitemAndSubcasePropertiesSync;

  @tracked subcaseName;
  @tracked caseTypes;
  @tracked subcaseType;
  @tracked caseType;
  @tracked showAsRemark;

  @tracked isSaving = false;

  constructor() {
    super(...arguments);
    this.showAsRemark = this.args.subcase.showAsRemark;
    this.subcaseName = this.args.subcase.subcaseName;
    this.loadSubcaseType.perform();
    this.loadCaseTypes.perform();
    this.loadCaseType.perform();
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
  async selectSubcaseType(type) {
    this.subcaseType = type;
    this.subcaseName = type.label;
  }

  @action
  selectCaseType(event) {
    const id = event.target.value;
    this.caseType = this.store.peekRecord('case-type', id);
    this.showAsRemark =
      this.caseType.get('uri') === CONSTANTS.CASE_TYPES.REMARK;
  }

  @action
  async saveChanges() {
    const resetFormallyOk = true;
    this.isSaving = true;

    const propertiesToSetOnAgendaitem = {
      showAsRemark: this.showAsRemark,
    };

    const propertiesToSetOnSubCase = {
      subcaseName: this.subcaseName,
      type: this.subcaseType,
      showAsRemark: this.showAsRemark,
    };
    const oldShowAsRemark = this.args.subcase.showAsRemark;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubCase,
      resetFormallyOk,
    );

    if (this.showAsRemark !== oldShowAsRemark) {
      await this.updateNewsletterAfterRemarkChange();
    }

    this.args.onSave();

    this.isSaving = false;
  }

  async updateNewsletterAfterRemarkChange() {
    const latestAgendaitem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    if (latestAgendaitem) {
      const newsletterInfo = await this.store.queryOne('newsletter-info', {
        'filter[agenda-item-treatment][agendaitems][:id:]': latestAgendaitem.id,
      });
      if (newsletterInfo?.id) {
        await newsletterInfo.destroyRecord();
      }
      if (this.showAsRemark) {
        const newNewsletterInfo =
          await this.newsletterService.createNewsItemForAgendaitem(
            latestAgendaitem,
            true
          );
        await newNewsletterInfo.save();
      }
    }
  }
}
