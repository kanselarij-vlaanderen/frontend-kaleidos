import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import CONFIG from 'frontend-kaleidos/utils/config';

export default class AccessLevelPillComponent extends Component {
  /**
   * An access-level pill component.
   *
   * @argument accessLevel: an accessLevel object or null
   * @argument confidential: boolean
   * @argument onChangeAccessLevel
   * @argument onConfirmChangeAccessLevel
   * @argument onCancelChangeAccessLevel
   * @argument onChangeConfidentiality
   */
  @service intl;
  @service('current-session') session;

  @tracked isEditing = false;

  get isLoading() {
    return this.confirmChangeAccessLevel.isRunning
      || this.cancelChangeAccessLevel.isRunning
      || this.changeConfidentiality.isRunning;
  }

  get inverseConfidentiality() {
    return !this.args.confidential;
  }

  get pillClass() {
    const baseClass = 'auk-pill';
    const classes = [baseClass, 'auk-u-cursor-pointer'];
    let modifier;
    if (this.args.accessLevel) {
      switch (this.args.accessLevel.id) {
        case CONFIG.publiekAccessLevelId:
          modifier = 'success';
          break;
        case CONFIG.internOverheidAccessLevelId:
          modifier = 'warning';
          break;
        case CONFIG.internRegeringAccessLevelId:
          modifier = 'danger';
          break;
      }
      if (modifier) {
        classes.push(`${baseClass}--${modifier}`);
      }
    }
    return classes.join(' ');
  }

  get accessLevelLabel() {
    if (this.args.accessLevel) {
      return this.args.accessLevel.label;
    }
    return this.intl.t('no-accessLevel');
  }

  @action
  toggleEdit() {
    if (this.session.isEditor) {
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

  @task
  *changeConfidentiality() {
    if (this.args.onChangeConfidentiality) {
      yield this.args.onChangeConfidentiality(!this.args.confidential);
    }
  }
}
