import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { translationRequestEmail } from 'frontend-kaleidos/utils/publication-email';
import { add } from 'ember-math-helpers/helpers/add';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument onSave: should take arguments (selectedPieces)
   * @argument onCancel
   */
  @service store;

  @tracked translationDueDate = this.args.translationSubcase.dueDate ? this.args.translationSubcase.dueDate : new Date();
  @tracked subject;
  @tracked message;

  constructor() {
    super(...arguments);
    this.setEmailFields.perform();
  }

  get totalPages() {
    const pages = this.args.attachments.mapBy('pages').filter((page) => page >= 0);
    return pages.length ? add(pages) : 0;
  }

  get totalWords() {
    const words = this.args.attachments.mapBy('words').filter((word) => word >= 0);
    return words.length ? add(words) : 0;
  }

  get totalDocuments() {
    return this.args.attachments.length;
  }

  get canSave() {
    return this.translationDueDate !== null
      && this.subject !== null
      && this.message !== null;
  }

  @task
  *setEmailFields() {
    const publicationFlow = this.args.publicationFlow;
    // should resolve immediately (already fetched)
    const identification = yield publicationFlow.identification;

    const mailParams = {
      identifier: identification.idName,
      title: publicationFlow.shortTitle,
      dueDate: this.translationDueDate,
      totalPages: this.totalPages,
      totalWords: this.totalWords,
      totalDocuments: this.totalDocuments,
    };

    this.message = translationRequestEmail(mailParams);
    this.subject = `Vertalingsaanvraag VO-dossier: ${identification.idName}`;
  }

  @action
  setTranslationDueDate(selectedDates) {
    this.translationDueDate = selectedDates[0];
    this.setEmailFields.perform();
  }

  @task
  *onSave() {
    if (this.args.onSave) {
      yield this.args.onSave({
        selectedPieces: this.args.attachments,
        translationDueDate: this.translationDueDate,
        subject: this.subject,
        message: this.message,
      });
    }
  }
}
