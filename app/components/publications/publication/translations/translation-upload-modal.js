import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';

export default class PublicationsTranslationTranslationUploadModalComponent extends Component {
  @tracked file = null;
  @tracked name = null;
  @tracked isSourceForProofPrint = false;
  @tracked receivedAtDate = new Date();

  get isSaveDisabled() {
    return this.file === null || this.receivedAtDate === null;
  }

  @action
  onUploadFile(file) {
    this.file = file;
    this.name = file.filenameWithoutExtension;
  }

  @task
  *saveTranslation() {
    yield this.args.onSave({
      file: this.file,
      name: this.name,
      receivedAtDate: this.receivedAtDate,
      isSourceForProofPrint: this.isSourceForProofPrint,
    });
  }

  @action
  toggleProofprint() {
    this.isSourceForProofPrint = !this.isSourceForProofPrint;
  }

  @action
  setReceivedAtDate(selectedDates) {
    this.receivedAtDate = selectedDates[0];
  }
}
