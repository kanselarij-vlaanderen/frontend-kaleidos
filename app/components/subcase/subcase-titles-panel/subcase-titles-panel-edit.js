import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument onCancel
 * @argument onSave
 */
export default class SubcaseTitlesPanelEdit extends Component {
  @service store;
  @service conceptStore;
  @service newsletterService;
  @service agendaitemAndSubcasePropertiesSync;

  @tracked subcaseName;
  @tracked subcaseType;
  @tracked agendaItemType;
  @tracked agendaItemTypes;

  @tracked isSaving = false;

  @service pieceAccessLevelService;
  @service agendaitemAndSubcasePropertiesSync;

  confidentialChanged = false;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'confidential']);

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
  async cancelEditing() {
    if (this.args.subcase.hasDirtyAttributes) {
      this.args.subcase.rollbackAttributes();
    }
    this.args.onCancel();
  }

  @task
  async saveChanges() {
    const trimmedTitle = trimText(this.args.subcase.title);
    const trimmedShortTitle = trimText(this.args.subcase.shortTitle);

    const resetFormallyOk = true;
    this.isSaving = true;

    const propertiesToSetOnAgendaitem = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      type: this.agendaItemType,
    };

    const propertiesToSetOnSubCase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      confidential: this.args.subcase.confidential,
      subcaseName: this.subcaseName,
      type: this.subcaseType,
      agendaItemType: this.agendaItemType,
    };

    // yield this.agendaitemAndSubcasePropertiesSync.saveChanges(
    //   this.args.subcase,
    //   propertiesToSetOnAgendaitem,
    //   propertiesToSetOnSubcase,
    //   true,
    // );
    // if (this.confidentialChanged && this.args.subcase.confidential) {
    //   yield this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
    //   yield this.pieceAccessLevelService.updateSubmissionAccessLevelOfSubcase(this.args.subcase);
    // }

    const oldAgendaItemType = await this.args.subcase.agendaItemType;
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubCase,
      resetFormallyOk,
    );

    if (this.agendaItemType.uri !== oldAgendaItemType.uri) {
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
