import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { trimText, cleanPasteInputForTextarea } from 'frontend-kaleidos/utils/trim-util';

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

  loadSubcaseType = task(async () => {
    this.subcaseType = await this.args.subcase.type;
  });

  loadAgendaItemType = task(async () => {
    this.agendaItemType = await this.args.subcase.agendaItemType;
  });

  loadAgendaItemTypes = task(async () => {
    const allAgendaItemTypes = await this.conceptStore.queryAllByConceptScheme(
      CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES
    );
    // ratification can only be NOTA, subcase type should be changed first (will open different edit modal)
    this.agendaItemTypes = allAgendaItemTypes.filter(
      (type) => type.uri !== CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT
    );
  });

  updateNewsItem = task(async () => {
    const latestAgendaitem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    if (latestAgendaitem) {
      await this.newsletterService.updateNewsItemVisibility(latestAgendaitem);
    }
  });

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
      false
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

  pasteIntoShortTitle = (pasteEvent) => {
    this.args.subcase.shortTitle = cleanPasteInputForTextarea(pasteEvent, 'short-title-subcase', this.args.subcase.shortTitle);
  }

  pasteIntoTitle = (pasteEvent) => {
    this.args.subcase.title = cleanPasteInputForTextarea(pasteEvent, 'title-subcase', this.args.subcase.title);
  }
}
