import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import {
  saveTitlesFromSubcase,
  cancelEdit,
} from 'frontend-kaleidos/utils/agendaitem-utils';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';

export default class SubcaseTitlesPanelEdit extends Component {
  @service store;
  propertiesToSet = Object.freeze([
    'title',
    'shortTitle',
    'confidential',
  ]);

  @action
  async cancelEditing() {
    cancelEdit(this.args.subcase, this.propertiesToSet);
    this.args.onCancel();
  }

  @task
  *saveChanges() {
    const trimmedTitle = trimText(this.args.subcase.title);
    const trimmedShortTitle = trimText(this.args.subcase.shortTitle);

    const propertiesToSetOnSubcase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      confidential: this.args.subcase.confidential,
    };

    yield saveTitlesFromSubcase(
      this.args.subcase,
      propertiesToSetOnSubcase
    );
    this.args.onSave();
  }
}
