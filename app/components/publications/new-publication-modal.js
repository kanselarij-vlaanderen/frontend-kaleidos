import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task, restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';

/**
 * @argument { undefined|AgendaItem } agendaitem: for a publication that passes the Council of Ministers
 * @argument { undefined|AgendaItemTreatment } agendaItemTreatment: for a publication that passes the Council of Ministers
 * @argument { () => void } onCancel
 * @argument { (publicationProperties: {
 *  number: number,
 *  suffix: undefined | string,
 *  shortTitle: string,
 *  longTitle: string,
 *  decisionDate: Date,
 *  publicationDueDate: Date,
 * })) => Promise<void> } onSave
 */
export default class NewPublicationModal extends Component {
  @service publicationService;
  @service store;

  @tracked number = null;
  @tracked suffix = null;
  @tracked decisionDate = null;
  @tracked openingDate;
  @tracked publicationDueDate = null;
  @tracked shortTitle = null;
  @tracked longTitle = null;

  @tracked numberIsAlreadyUsed = false;
  @tracked numberIsRequired = false;
  @tracked isEnabledErrorOnShortTitle = false;

  constructor() {
    super(...arguments);
    this.initPublicationNumber.perform();
    if (this.isViaCouncilOfMinisters) {
      this.shortTitle = this.args.agendaitem.shortTitle;
      this.longTitle = this.args.agendaitem.title;
      this.decisionDate = this.args.agendaItemTreatment.startDate;
    }
    this.openingDate = new Date();
  }

  get isViaCouncilOfMinisters() {
    return !!this.args.agendaitem;
  }

  get publicationNumberErrorTranslationKey() {
    if (this.numberIsRequired) {
      return 'publication-number-required-and-numeric';
    } else if (this.numberIsAlreadyUsed) {
      return 'publication-number-already-taken';
    } else {
      return null;
    }
  }

  get isPublicationNumberValid() {
    return this.publicationNumberErrorTranslationKey == null;
  }

  get isShortTitleValid() {
    return this.shortTitle && this.shortTitle.length > 0;
  }

  get isShownShortTitleError() {
    return this.isEnabledErrorOnShortTitle && !this.isShortTitleValid;
  }

  get isValid() {
    return this.isPublicationNumberValid && this.isShortTitleValid;
  }

  @task
  *initPublicationNumber() {
    const latestPublication = yield this.store.queryOne('publication-flow', {
      sort: '-identification.structured-identifier.local-identifier',
      include: 'identification.structured-identifier',
    });
    if (latestPublication) {
      const identification = yield latestPublication.identification;
      const structuredIdentifier = yield identification.structuredIdentifier;
      this.number = structuredIdentifier.localIdentifier + 1;
    } else {
      this.number = 1;
    }
  }

  @restartableTask
  *setPublicationNumber(event) {
    this.number = event.target.value;
    const number = parseInt(this.number, 10);
    if (isBlank(this.number) || Object.is(NaN, number)) {
      this.numberIsRequired = true;
    } else {
      this.numberIsRequired = false;
      yield timeout(1000);
      yield this.isPublicationNumberAlreadyTaken();
    }
  }

  @restartableTask
  *setPublicationNumberSuffix(event) {
    this.suffix = isBlank(event.target.value) ? undefined : event.target.value;
    yield timeout(1000);
    yield this.isPublicationNumberAlreadyTaken();
  }

  @task
  *save() {
    yield this.args.onSave({
      number: this.number,
      suffix: this.suffix,
      shortTitle: this.shortTitle,
      longTitle: this.longTitle,
      decisionDate: this.decisionDate,
      openingDate: this.openingDate,
      publicationDueDate: this.publicationDueDate,
    });
  }

  async isPublicationNumberAlreadyTaken() {
    this.numberIsAlreadyUsed =
      await this.publicationService.publicationNumberAlreadyTaken(
        this.number,
        this.suffix
      );
  }

  @action
  enableErrorOnShortTitle() {
    this.isEnabledErrorOnShortTitle = true;
  }

  @action
  setDecisionDate(selectedDates) {
    // undefined if user clears the date picker
    this.decisionDate = selectedDates[0];
  }

  @action
  setOpeningDate(selectedDates) {
    // undefined if user clears the date picker
    this.openingDate = selectedDates[0];
  }

  @action
  setPublicationDueDate(selectedDates) {
    // undefined if user clears the date picker
    this.publicationDueDate = selectedDates[0];
  }
}
