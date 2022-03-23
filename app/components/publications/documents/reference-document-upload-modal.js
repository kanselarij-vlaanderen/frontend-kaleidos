import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { task, dropTask } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';

/**
 * @argument {PublicationFlow} publicationFlow *
 * @argument onSave
 * @argument onCancel
 */
export default class PublicationsDocumentsReferenceDocumentUploadModalComponent extends Component {
  @service publicationService;

  validators;

  @tracked piece;

  constructor() {
    super(...arguments);

    this.initValidation();
  }

  get isLoading() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isCancelDisabled() {
    return this.cancel.isRunning || this.save.isRunning;
  }

  get isSaveDisabled() {
    return !this.piece || !this.validators.areValid || this.cancel.isRunning;
  }

  @dropTask
  *cancel() {
    if (this.piece) {
      yield this.publicationService.deletePiece(this.piece);
    }
    this.args.onCancel();
  }

  @task
  *save() {
    yield this.args.onSave(this.piece);
  }

  @action
  async createPiece(file) {
    this.piece = await this.publicationService.createPiece(file);
  }

  initValidation() {
    this.validators = new ValidatorSet({
      name: new Validator(() => isPresent(this.piece.name)),
    });
  }
}
