import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import {
  isNone, isPresent
} from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import {
  ValidatorSet, Validator
} from 'frontend-kaleidos/utils/validators';

/**
 * @argument {PublicationFlow} publicationFlow
 * @argument {Piece} piece
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsPublicationProofsProofEditModalComponent extends Component {
  @service currentSession;

  @tracked name = this.args.piece.name;
  @tracked receivedAtDate = this.args.piece.receivedDate;
  @tracked publicationSubcaseCorrectionFor;

  validators;

  constructor() {
    super(...arguments);

    this.loadData.perform();
    this.initValidation();
  }

  get isCorrected() {
    return isPresent(this.publicationSubcaseCorrectionFor);
  }

  get isReceived() {
    return isNone(this.publicationSubcaseCorrectionFor);
  }

  get isCancelDisabled() {
    return this.save.isRunning;
  }

  get isSaveDisabled() {
    return !this.validators.areValid;
  }

  get isLoading() {
    return this.loadData.isRunning || this.save.isRunning;
  }

  @task
  *loadData() {
    // load publicationSubcaseCorrectionFor to avoid to async in getters and template
    // it should resolve immediately because it is already included
    this.publicationSubcaseCorrectionFor = yield this.args.piece.publicationSubcaseCorrectionFor;
  }

  @task
  *save() {
    yield this.args.onSave({
      name: this.name,
      receivedAtDate: this.receivedAtDate,
    });
  }

  @action
  setReceivedAtDate(selectedDates) {
    this.validators.receivedAtDate.enableError();

    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    } else { // this case occurs when users manually empty the date input-field
      // trigger date-picker update
      // eslint-disable-next-line no-self-assign
      this.receivedAtDate = this.receivedAtDate;
    }
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.name)),
      // if loading: false, if isReceived: true, if isCorrected: check presence
      receivedAtDate: new Validator(() => !this.loadData.isRunning && (!this.isReceived || isPresent(this.receivedAtDate))),
    });
  }
}
