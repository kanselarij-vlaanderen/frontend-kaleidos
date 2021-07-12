import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { isBlank } from '@ember/utils';

export default class PublicationsTranslationDocumentEditModalComponent extends Component {
  @tracked name = this.args.sourceDocument.name;
  @tracked pagesAmount = this.args.sourceDocument.pages;
  @tracked wordsAmount = this.args.sourceDocument.words;
  @tracked isSourceForProofPrint;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    const subcase = yield this.args.sourceDocument.publicationSubcase;
    this.isSourceForProofPrint = !!subcase ;
  }

  get saveIsDisabled() {
    return isBlank(this.name);
  }

  @task
  *saveEditDocument() {
    if (this.args.onSave) {
      yield this.args.onSave({
        name: this.name,
        pagesAmount: this.pagesAmount,
        wordsAmount: this.wordsAmount,
        isSourceForProofPrint: this.isSourceForProofPrint,
      });
    }
  }

  @action
  toggleProofprint() {
    this.isSourceForProofPrint = !this.isSourceForProofPrint;
  }
}
