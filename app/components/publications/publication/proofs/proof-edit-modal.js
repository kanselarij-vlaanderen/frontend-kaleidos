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

  @tracked file = this.args.piece.file;
  @tracked name = this.args.piece.name;
  @tracked receivedAtDate = this.args.piece.receivedDate;
  @tracked publicationSubcaseCorrectionFor;

  validators;

  constructor() {
    super(...arguments);

    this.init();
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

  @task
  *loadData() {
    this.publicationSubcaseCorrectionFor = yield this.args.piece.publicationSubcaseCorrectionFor;
  }

  @task
  *save() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
      receivedAtDate: this.receivedAtDate,
    });
  }

  @action
  setReceivedAtDate(selectedDates) {
    this.validators.receivedAtDate.enableError();

    if (selectedDates.length) {
      this.receivedAtDate = selectedDates[0];
    }
  }

  async init() {
    // load publicationSubcaseCorrectionFor to avoid to async in getters and template
    // it should resolve immediately because it is already included
    await this.loadData.perform();
    this.initValidation();
  }

  initValidation() {
    const validators = {
      name: new Validator(() => isPresent(this.name)),
    };
    if (this.isReceived) {
      validators.receivedAtDate = new Validator(() => isPresent(this.receivedAtDate));
    }

    this.validators = new ValidatorSet(validators);
  }
}
