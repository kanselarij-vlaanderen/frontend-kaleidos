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
   * @argument agendaIsApproved
   * @argument agendaIsFinal
   * @argument agendaIsReleased
   * @argument agendaIsPublished
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

  get pillSkin() {
    let modifier = 'default';
    if (this.args.accessLevel) {
      switch (this.args.accessLevel.uri) {
        case CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE:
        case CONSTANTS.ACCESS_LEVELS.MINISTERRAAD:
        case CONSTANTS.ACCESS_LEVELS.INTERN_REGERING:
          modifier = 'danger';
          break;
        case CONSTANTS.ACCESS_LEVELS.INTERN_OVERHEID:
          if (this.args.agendaIsFinal && this.args.agendaIsReleased) {
            modifier = 'warning';
          }
          break;
        case CONSTANTS.ACCESS_LEVELS.PUBLIEK:
          modifier = 'success';
          break;
        default:
      }
    }
    return modifier;
  }

  get accessLevelLabel() {
    if (this.args.accessLevel) {
      return this.args.accessLevel.label;
    }
    return this.intl.t('no-accessLevel');
  }

  get canEdit() {
    return this.session.may('manage-document-access-levels');
  }

  @action
  toggleEdit() {
    if (this.canEdit) {
      this.isEditing = !this.isEditing;
    }
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
