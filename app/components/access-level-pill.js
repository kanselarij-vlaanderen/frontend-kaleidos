import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { task } from 'ember-concurrency';

export default class AccessLevelPillComponent extends Component {
  /**
   * An access-level pill component.
   *
   * @argument accessLevel: an accessLevel object or null
   * @argument isEditable: provide editing option (with built-in role check)
   * @argument onChangeAccessLevel
   * @argument onConfirmChangeAccessLevel
   * @argument onCancelChangeAccessLevel
   */
  @service intl;
  @service('current-session') session;

  @tracked isEditing = false;

  get isLoading() {
    return this.confirmChangeAccessLevel.isRunning
      || this.cancelChangeAccessLevel.isRunning;
  }

  get pillIcon() {
    let icon = '';
    if (this.args.accessLevel) {
      switch (this.args.accessLevel.get('uri')) {
        case CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE:
          icon = 'user';
          break;
        case CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK:
          icon = 'lock-closed';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          icon = 'circle';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          icon = 'circle-full';
          break;
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          icon = 'users-four-of-four';
          break;
        default:
      }
    }
    return icon;
  }

  get pillSkin() {
    let skin = 'warning';
    if (this.args.accessLevel) {
      switch (this.args.accessLevel.get('uri')) {
        case CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE:
          skin = 'warning';
          break;
        case CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK:
          skin = 'warning';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          skin = 'warning';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          skin = 'border';
          break;
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          skin = 'success';
          break;
        default:
      }
    }
    return skin;
  }

  get accessLevelLabel() {
    return this.args.accessLevel ? this.args.accessLevel.get('label') : this.intl.t('no-accessLevel');
  }

  get canEdit() {
    return this.args.isEditable && this.session.may('manage-document-access-levels');
  }

  @action
  openEditMode() {
    this.isEditing = true;
  }

  @action
  changeAccessLevel(accessLevel) {
    if (this.args.onChangeAccessLevel) {
      this.args.onChangeAccessLevel(accessLevel);
    }
  }

  @task
  *confirmChangeAccessLevel(accessLevel) {
    if (this.args.onConfirmChangeAccessLevel) {
      yield this.args.onConfirmChangeAccessLevel(accessLevel);
    }
    this.isEditing = false;
  }

  @task
  *cancelChangeAccessLevel() {
    if (this.args.onCancelChangeAccessLevel) {
      yield this.args.onCancelChangeAccessLevel();
    }
    this.isEditing = false;
  }
}
