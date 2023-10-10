import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import ENV from 'frontend-kaleidos/config/environment';

export default class SubcaseDescriptionEdit extends Component {
  /**
   * @argument subcase
   * @argument onCancel
   * @argument onSave
   */
  @service store;
  @service conceptStore;
  @service decisionReportGeneration;
  @service newsletterService;
  @service agendaitemAndSubcasePropertiesSync;

  @tracked subcaseName;
  @tracked subcaseType;
  @tracked agendaItemType;
  @tracked agendaItemTypes;

  @tracked isSaving = false;

  constructor() {
    super(...arguments);
    this.subcaseName = this.args.subcase.subcaseName;
    this.loadSubcaseType.perform();
    this.loadAgendaItemType.perform();
    this.loadAgendaItemTypes.perform();
  }

  @task
  *loadSubcaseType() {
    this.subcaseType = yield this.args.subcase.type;
  }

  @task
  *loadAgendaItemType() {
    this.agendaItemType = yield this.args.subcase.agendaItemType;
  }

  @task
  *loadAgendaItemTypes() {
    this.agendaItemTypes = yield this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES);
  }

  @action
  async selectSubcaseType(type) {
    this.subcaseType = type;
    this.subcaseName = type.label;
  }

  @action
  onChangeAgendaItemType(selectedType) {
    this.agendaItemType = selectedType;
  }

  @action
  async saveChanges() {
    const resetFormallyOk = true;
    this.isSaving = true;

    const propertiesToSetOnAgendaitem = {
      type: this.agendaItemType,
    };

    const propertiesToSetOnSubCase = {
      subcaseName: this.subcaseName,
      type: this.subcaseType,
      agendaItemType: this.agendaItemType,
    };
    const oldAgendaItemType = await this.args.subcase.agendaItemType;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubCase,
      resetFormallyOk,
    );

    if (this.agendaItemType.uri !== oldAgendaItemType.uri) {
      await this.updateNewsletterAfterRemarkChange();
      await this.updateDecisionActivities();
    }

    this.args.onSave();

    this.isSaving = false;
  }

  get enableDigitalAgenda() {
    return (
      ENV.APP.ENABLE_DIGITAL_AGENDA === 'true' ||
      ENV.APP.ENABLE_DIGITAL_AGENDA === true
    );
  }

  async updateDecisionActivities() {
    if (this.enableDigitalAgenda) {
      const decisionActivities = await this.args.subcase.decisionActivities;
      for (const decisionActivity of decisionActivities) {
        const report = await this.store.queryOne('report', {
          'filter[:has-no:next-piece]': true,
          'filter[decision-activity][:id:]': decisionActivity.id,
        });
        const pieceParts = await report?.pieceParts;
        if (pieceParts?.length) {
          await this.decisionReportGeneration.generateReplacementReport.perform(
            report
          );
          this.updateReportName(report, this.agendaItemType.uri);
          report.save();
        }
      }
    }
  }

  updateReportName(report, agendaitemTypeUri) {
    if (agendaitemTypeUri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
      report.name = report.name.replace("punt", "mededeling");
    } else {
      report.name = report.name.replace("mededeling", "punt");
    }
  }

  async updateNewsletterAfterRemarkChange() {
    const latestAgendaitem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    if (latestAgendaitem) {
      const newsItem = await this.store.queryOne('news-item', {
        'filter[agenda-item-treatment][agendaitems][:id:]': latestAgendaitem.id,
      });
      if (newsItem?.id) {
        await newsItem.destroyRecord();
      }
      if (this.agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
        const newNewsItem =
          await this.newsletterService.createNewsItemForAgendaitem(
            latestAgendaitem,
            true
          );
        await newNewsItem.save();
      }
    }
  }
}
