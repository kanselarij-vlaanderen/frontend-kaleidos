import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument subcase
 * @argument onCancel
 * @argument onSave
 */
export default class SubcaseTitlesPanelEdit extends Component {
  @service pieceAccessLevelService;
  @service agendaitemAndSubcasePropertiesSync;
  @service store;

  confidentialChanged = false;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'confidential']);

  @action
  async cancelEditing() {
    if (this.args.subcase.hasDirtyAttributes) {
      this.args.subcase.rollbackAttributes();
    }
    this.args.onCancel();
  }

  @task
  *removeFromNewsletter() {
    const agendaitem = yield this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
    });

    if (agendaitem) {
      const agendaitemType = yield agendaitem.type;
      if (agendaitemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT) {
        const treatment = yield agendaitem.treatment;
        const newsItem = yield treatment?.newsItem;
        if (newsItem) {
          newsItem.inNewsletter = false;
          yield newsItem.save();
        }
      }
    }
  }

  @task
  *saveChanges() {

    const trimmedTitle = trimText(this.args.subcase.title);
    const trimmedShortTitle = trimText(this.args.subcase.shortTitle);

    const propertiesToSetOnAgendaitem = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
    };
    const propertiesToSetOnSubcase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      confidential: this.args.subcase.confidential,
    };

    yield this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true,
    );
    if (this.confidentialChanged && this.args.subcase.confidential) {
      yield this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
      yield this.pieceAccessLevelService.updateSubmissionAccessLevelOfSubcase(this.args.subcase);
      yield this.removeFromNewsletter.perform();
    }
    this.args.onSave();
  }
}
