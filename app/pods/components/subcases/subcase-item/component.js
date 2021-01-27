import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';

export default class SubcaseItemSubcasesComponent extends Component {
  @service store;

  @tracked isShowingDocuments = false;
  @tracked hasDocumentsToShow = false;

  constructor() {
    super(...arguments);
    this.updateHasDocumentsToShow.perform();
  }

  @task
  *updateHasDocumentsToShow() {
    const doc = yield this.store.queryOne('submission-activity', {
      'filter[subcase][:id:]': this.args.subcase.id,
      'filter[:has:pieces]': 'true',
    });
    this.hasDocumentsToShow = doc !== null;
  }

  @action
  toggleIsShowingDocuments() {
    this.isShowingDocuments = !this.isShowingDocuments;
  }
}
