import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument onCancel
 * @argument onSave
 */
export default class SubcaseTitlesPanelEdit extends Component {
  @service pieceAccessLevelService;
  @service agendaitemAndSubcasePropertiesSync;
  @service store;
  @service newsletterService;

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
      yield this.updateNewsItem.perform();
    }
    this.args.onSave();
  }
}
