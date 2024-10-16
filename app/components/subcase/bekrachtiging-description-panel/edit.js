import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';

export default class SubcaseBekrachtigingDescriptionPanelEdit extends Component {
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
  @service pieceAccessLevelService;

  @tracked subcaseName;
  @tracked subcaseType;
  @tracked agendaItemType;
  @tracked agendaItemTypes;

  @tracked isSaving = false;

  confidentialChanged = false;

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
    this.agendaItemTypes = yield this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES
    );
  }

  @task
  *updateNewsItem() {
    const latestAgendaitem = yield this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    if (latestAgendaitem) {
      yield this.newsletterService.updateNewsItemVisibility(latestAgendaitem);
    }
  }

  @action
  async cancelEditing() {
    if (this.args.subcase.hasDirtyAttributes) {
      this.args.subcase.rollbackAttributes();
    }
    this.args.onCancel();
  }

  @action
  async selectSubcaseType(type) {
    this.subcaseType = type;
  }

  @action
  onChangeAgendaItemType(selectedType) {
    this.agendaItemType = selectedType;
  }

  @action
  async saveChanges() {
    const resetFormallyOk = true;
    this.isSaving = true;

    const trimmedTitle = trimText(this.args.subcase.title);
    const trimmedShortTitle = trimText(this.args.subcase.shortTitle);

    const propertiesToSetOnAgendaitem = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      type: this.agendaItemType,
    };

    const propertiesToSetOnSubCase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      subcaseName: this.subcaseName,
      type: this.subcaseType,
      agendaItemType: this.agendaItemType,
    };
    const oldAgendaItemType = await this.args.subcase.agendaItemType;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubCase,
      resetFormallyOk
    );

    if (this.confidentialChanged && this.args.subcase.confidential) {
      await this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
      await this.pieceAccessLevelService.updateSubmissionAccessLevelOfSubcase(this.args.subcase);
      await this.updateNewsItem.perform();
    }

    if (this.agendaItemType.uri !== oldAgendaItemType.uri) {
      await this.updateNewsletterAfterRemarkChange();
      await this.updateDecisionReports();
    }

    this.args.onSave();

    this.isSaving = false;
  }

  async updateDecisionReports() {
    const reports = await this.store.queryAll('report', {
      'filter[decision-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-piece]': true,
      sort: '-created',
    });
    for (const report of reports.slice()) {
      const pieceParts = await report?.pieceParts;
      if (pieceParts?.length) {
        this.updateReportName(report, this.agendaItemType.uri);
        await report.belongsTo('file').reload();
        await report.save();
        await this.decisionReportGeneration.generateReplacementReport.perform(
          report
        );
      }
    }
  }

  updateReportName(report, agendaitemTypeUri) {
    if (agendaitemTypeUri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
      report.name = report.name.replace('punt', 'mededeling');
    } else {
      report.name = report.name.replace('mededeling', 'punt');
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
      if (
        this.agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT
      ) {
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
