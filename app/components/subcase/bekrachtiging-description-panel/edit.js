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
    const allAgendaItemTypes = yield this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES
    );
    // ratification can only be NOTA, subcase type should be changed first (will open different edit modal)
    this.agendaItemTypes = allAgendaItemTypes.filter(
      (type) => type.uri !== CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT
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
    };

    const propertiesToSetOnSubCase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      subcaseName: this.subcaseName,
      type: this.subcaseType,
    };
    await this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubCase,
      resetFormallyOk
    );

    // ratifications shouldn't realistically be confidential
    if (this.confidentialChanged && this.args.subcase.confidential) {
      await this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
      await this.pieceAccessLevelService.updateSubmissionAccessLevelOfSubcase(this.args.subcase);
      await this.updateNewsItem.perform();
      // we do not regenerate report in this case, shouldn't really happen
    }

    this.args.onSave();

    this.isSaving = false;
  }
}
