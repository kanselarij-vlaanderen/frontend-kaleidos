import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { saveChanges as saveSubcaseTitles } from 'frontend-kaleidos/utils/agendaitem-utils';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';

/**
 * @argument subcase
 * @argument onCancel
 * @argument onSave
 */
export default class SubcaseTitlesPanelEdit extends Component {
  @service store;
  @service pieceAccessLevelService;

  propertiesToSet = Object.freeze(['title', 'shortTitle', 'confidential']);

  @action
  async cancelEditing() {
    if (this.args.subcase.hasDirtyAttributes) {
      this.args.subcase.rollbackAttributes();
    }
    this.args.onCancel();
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

    yield saveSubcaseTitles(
      this.args.subcase,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      true
    );
    if (this.args.subcase.confidential) {
      yield this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
    }
    this.args.onSave();
  }
}
