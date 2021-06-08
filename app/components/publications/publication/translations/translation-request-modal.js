import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsTranslationRequestModalComponent extends Component {
  /**
   * @argument onSave: should take arguments (pieces)
   * @argument onCancel
   */
  @service store;

  @tracked translationDueDate = this.args.translationSubcase.dueDate ? this.args.translationSubcase.dueDate : new Date();
  @tracked subject = `Vertalingsaanvraag VO-dossier: ${this.args.publicationFlow.identification.structuredIdentifier.localIdentifier}`;
  @tracked message = `${' Collega,\n'
    + '\n'
    + 'In bijlage document(en) die wij indienen voor vertaling.\n'
    + '\n'
    + 'Het betreft:\n'
    + '\n'
    + 'VO-dossier: '}${this.args.publicationFlow.identification.structuredIdentifier.localIdentifier}\n`
    + `Titel: ${this.args.publicationFlow.shortTitle}\n`
    + `Uiterste vertaaldatum: ${this.translationDueDate}\n`
    + `Aantal pagina’s: ${this.getAmountPages}\n`
    + `Aantal woorden: ${this.getAmountWords}\n`
    + `Aantal documenten: ${this.getAmountDocuments}’\n`
    + '\n'
    + 'Vragen bij dit dossier kunnen met vermelding van publicatienummer gericht worden aan onderstaande email adres.';


  get getAmountPages() {
    let amount = 0;
    for (const piece of this.args.pieces) {
      amount += piece.pages;
    }
    return amount;
  }

  get getAmountWords() {
    let amount = 0;
    for (const piece of this.args.pieces) {
      amount += piece.words;
    }
    return amount;
  }

  get getAmountDocuments() {
    return this.args.pieces.length;
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
      yield this.args.onSave({});
    }
  }
}
