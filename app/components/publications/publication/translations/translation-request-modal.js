import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import moment from 'moment';
import { add } from 'ember-math-helpers/helpers/add';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument onSave: should take arguments (selectedPieces)
   * @argument onCancel
   */
  @service store;

  @tracked translationDueDate = this.args.translationSubcase.dueDate ? this.args.translationSubcase.dueDate : new Date();
  @tracked subject = `Vertalingsaanvraag VO-dossier: ${this.args.identification.idName}`;
  @tracked message = ' Collega,\n'
    + '\n'
    + 'In bijlage document(en) die wij indienen voor vertaling.\n'
    + '\n'
    + 'Het betreft:\n'
    + '\n'
    + `VO-dossier: ${this.args.identification.idName}\n`
    + `Titel: ${this.args.publicationFlow.shortTitle}\n`
    + `Uiterste vertaaldatum: ${moment(this.translationDueDate).format('DD-MM-YYYY')}\n`
    + `Aantal pagina’s: ${this.totalPages}\n`
    + `Aantal woorden: ${this.totalWords}\n`
    + `Aantal documenten: ${this.totalDocuments}\n`
    + '\n'
    + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaande email adres.';


  get totalPages() {
    const pages = this.args.selectedPieces.mapBy('pages').filter((page) => page >= 0);
    return add(pages);
  }

  get totalWords() {
    const words = this.args.selectedPieces.mapBy('words').filter((word) => word >= 0);
    return add(words);
  }

  get totalDocuments() {
    return this.args.selectedPieces.length;
  }


  @action
  setTranslationDueDate(selectedDates) {
    this.translationDueDate = selectedDates[0];
  }

  get saveIsDisabled() {
    return this.translationDueDate === null
      || this.subject === null
      || this.message === null;
  }


  @action
  cancelRequest() {
    this.args.onCancel();
  }

  @task
  *saveRequest() {
    if (this.args.onSave) {
      yield this.args.onSave({
        selectedPieces: this.args.selectedPieces,
        translationDueDate: this.translationDueDate,
        subject: this.subject,
        message: this.message,
      });
    }
  }
}
