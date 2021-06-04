import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { guidFor } from '@ember/object/internals';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument onSave: should take arguments (pieces)
   * @argument onCancel
   */
  @service store;

  @tracked name = null;
  @tracked pagesAmount = null;
  @tracked wordsAmount = null;

  get saveIsDisabled() {
    return this.translationDocument === null
      || this.name === null
      || this.pagesAmount === null
      || this.wordsAmount === null;
  }


  @action
  cancelRequest() {
    this.args.onCancel();
  }

  @task
  *saveRequest() {
    if (this.args.onSave) {
      yield this.args.onSave({
        piece: this.translationDocument,
        name: this.name,
        pagesAmount: this.pagesAmount,
        wordsAmount: this.wordsAmount,
      });
    }
  }
}
