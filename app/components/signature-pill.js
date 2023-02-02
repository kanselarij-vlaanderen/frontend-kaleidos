import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class SignaturePillComponent extends Component {
  @service intl;
  @service('current-session') session;

  @tracked isEditing = false;

  get canEdit() {
    return this.args.isEditable;
  }

  @action
  openEditMode() {
    this.isEditing = true;
  }

  @action
  closeEditMode() {
    this.isEditing = false;
  }

  @task
  *confirmChangeSignatureLevel() {
    this.isEditing = false;
  }

  @task
  *cancelChangeSignatureLevel() {
    this.isEditing = false;
  }
}
