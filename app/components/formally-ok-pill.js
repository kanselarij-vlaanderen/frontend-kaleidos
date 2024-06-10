import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency';

export default class StatusPillComponent extends Component {
  /**
   * An access-level pill component.
   *
   * @argument status: an Status object or null
   * @argument isEditable: provide editing option (with built-in role check)
   * @argument onChangeStatus
   * @argument onConfirmChangeStatus
   * @argument onCancelChangeStatus
   */
  @service intl;
  @service('current-session') session;

  @tracked isEditing = false;

  get isLoading() {
    return this.confirmChangeStatus.isRunning
      || this.cancelChangeStatus.isRunning;
  }

  get pillIcon() {
    let icon = '';
    if (this.args.status) {
      switch (this.args.status) {
        case "Nog niet formeel OK":
          icon = 'question-circle';
          break;
        case "Formeel OK":
          icon = 'check';
          break;
        default:
      }
    }
    return icon;
  }

  get pillSkin() {
    let skin = 'border';
    if (this.args.status) {
      switch (this.args.status) {
        case "Nog niet formeel OK":
          skin = 'border';
          break;
        case "Formeel OK":
          skin = 'success';
          break;
        default:
      }
    }
    return skin;
  }

  get statusLabel() {
    return this.args.status;
  }

  get canEdit() {
    return this.args.isEditable && this.session.may('manage-document-access-levels');
  }

  @action
  openEditMode() {
    this.isEditing = true;
  }

  @action
  changeStatus(Status) {
    if (this.args.onChangeStatus) {
      this.args.onChangeStatus(Status);
    }
  }

  @task
  *confirmChangeStatus(Status) {
    if (this.args.onConfirmChangeStatus) {
      yield this.args.onConfirmChangeStatus(Status);
    }
    this.isEditing = false;
  }

  @task
  *cancelChangeStatus() {
    if (this.args.onCancelChangeStatus) {
      yield this.args.onCancelChangeStatus();
    }
    this.isEditing = false;
  }
}
