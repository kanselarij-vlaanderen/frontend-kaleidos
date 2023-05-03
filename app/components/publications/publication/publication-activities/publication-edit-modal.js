import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { ValidatorSet, Validator } from 'frontend-kaleidos/utils/validators';
import { tracked } from '@glimmer/tracking';

/**
 * Component for manually updating a publication date
 * for publications that are not found in the Staatsblad (yet)
 */
export default class PublicationEditModal extends Component {
  @tracked publicationDate;

  constructor() {
    super(...arguments);
    this.publicationDate = this.args.publicationDate;
    this.initValidators();
  }

  initValidators() {
    this.validators = new ValidatorSet({
      publicationDate: new Validator(() => this.publicationDate !== undefined),
    });
  }

  get isSaveDisabled() {
    return !this.validators.areValid;
  }

  @action
  setPublicationDate(selectedDate) {
    this.publicationDate = selectedDate;
    this.validators.publicationDate.enableError();
  }

  @task
  *save() {
    yield this.args.onSave({
      publicationDate: this.publicationDate,
    });
  }
}
