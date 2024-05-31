import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import addLeadingZeros from 'frontend-kaleidos/utils/add-leading-zeros';
import { reorderAgendaitemsOnAgenda } from 'frontend-kaleidos/utils/agendaitem-utils';

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
  @service pieceAccessLevelService;
  @service currentSession;

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

    const trimmedTitle = trimText(this.args.subcase.title);
    const trimmedShortTitle = trimText(this.args.subcase.shortTitle);

    const oldAgendaItemType = await this.args.subcase.agendaItemType;
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

    const agendaitemTypeChanged = this.agendaItemType.uri !== oldAgendaItemType.uri;
    if (agendaitemTypeChanged) {
      const agendaitemNumber = await this.calculateAgendaitemNumber();
      if (agendaitemNumber) {
        propertiesToSetOnAgendaitem.number = agendaitemNumber;
      }
    }

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

    if (agendaitemTypeChanged) {
      await this.updateNewsletterAfterRemarkChange();
      await this.updateDecisionReport(propertiesToSetOnAgendaitem.number);
      await this.recalculateAllAgendaitemNumbersOnAgenda()
    }

    this.args.onSave();

    this.isSaving = false;
  }

  async recalculateAllAgendaitemNumbersOnAgenda() {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    if (agendaitem) {
      const agenda = await agendaitem.agenda;
      await reorderAgendaitemsOnAgenda(
        agenda,
        this.store,
        this.decisionReportGeneration,
        this.currentSession.may('manage-agendaitems'),
      );
    }

  }

  async calculateAgendaitemNumber() {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    if (agendaitem) {
      const agenda = await agendaitem.agenda;
      const latestAgendaitemOfType = await this.store.queryOne('agendaitem', {
        'filter[agenda][:id:]': agenda.id,
        'filter[:has-no:next-version]': 't',
        'filter[type][:uri:]': this.agendaItemType.uri,
        sort: '-number'
      });
      return latestAgendaitemOfType ? latestAgendaitemOfType.number + 1 : 1;
    }
    return undefined;
  }

  async updateDecisionReport() {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    if (agendaitem) {
      const report = await this.store.queryOne('report', {
        'filter[:has-no:next-piece]': true,
        'filter[:has:piece-parts]': true,
        'filter[decision-activity][treatment][agendaitems][:id:]': agendaitem.id,
      });
      const pieceParts = await report?.pieceParts;
      if (pieceParts?.length) {
        this.updateReportName(
          report,
          this.agendaItemType.uri,
          agendaitem.number
        );
        await report.belongsTo('file').reload();
        await report.save();
        await this.decisionReportGeneration.generateReplacementReport.perform(
          report
        );
      }
    }
  }

  updateReportName(report, agendaitemTypeUri, agendaitemNumber) {
    const paddedNumber = addLeadingZeros(agendaitemNumber, 4);
    if (agendaitemTypeUri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
      report.name = report.name.replace(/punt [0-9]{4}/, `mededeling ${paddedNumber}`);
    } else {
      report.name = report.name.replace(/mededeling [0-9]{4}/g, `punt ${paddedNumber}`);
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
