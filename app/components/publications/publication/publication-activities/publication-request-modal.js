import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PublicationTimelineEventPanel extends Component {
  @tracked subject;
  @tracked message;
  @tracked files = [];

  @action
  didUpload(file) {
    this.files.pushObject(file);
  }

  @task
  *cancel() {
    yield this.performCancel();
  }

  @task
  *save() {
    const requestParams = {
      subject: this.subject,
      message: this.message,
      files: this.files,
    }
    yield this.args.onSave(requestParams);
  }

  @action
  async performCancel() {
    await Promise.all(this.files.map(file => file.destroyRecord()));
  }
}
