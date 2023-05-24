import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { tracked } from '@glimmer/tracking';

/**
 * Component for manually registered publications
 * for publications that are not found in the Staatsblad (yet)
 */
export default class PublicationDetailsModal extends Component {
  @tracked publicationDate = new Date();
  @tracked mustUpdatePublicationStatus = true;

  constructor() {
    super(...arguments);
    this.initValidators();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      publicationDate: new Validator(() => this.publicationDate !== undefined),
    });
  }

  get isSaveDisabled() {
    return !this.validators.areValid || this.save.isRunning;
  }

  @action
  setPublicationDate(selectedDate) {
    this.publicationDate = selectedDate;
    this.validators.publicationDate.enableError();
  }

  @action
  setMustUpdatePublicationStatus(checked) {
    this.mustUpdatePublicationStatus = checked;
  }

  @task
  *save() {
    yield this.args.onSave({
      publicationDate: this.publicationDate,
      mustUpdatePublicationStatus: this.mustUpdatePublicationStatus,
    });
  }
}
