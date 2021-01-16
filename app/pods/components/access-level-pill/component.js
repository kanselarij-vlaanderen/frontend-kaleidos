import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency-decorators';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import CONFIG from 'fe-redpencil/utils/config';

export default class AccessLevelPill extends Component {
  /**
   * An access-level pill component specific to the piece model.
   *
   * @argument piece: a Piece
   */
  @service() intl;
  @service('current-session') session;

  @tracked accessLevel;
  @alias('args.piece.confidential') confidential;
  @tracked isEditing = false;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  get isLoading() {
    return this.loadData.isRunning
      || this.toggleAndSaveConfidentiality.isRunning
      || this.saveAccessLevel.isRunning;
  }

  get accessLevelClass() {
    if (this.accessLevel) {
      switch (this.accessLevel.id) {
        case CONFIG.publiekAccessLevelId:
          return 'vlc-pill--success';
        case CONFIG.internOverheidAccessLevelId:
          return 'vlc-pill--warning';
        case CONFIG.internRegeringAccessLevelId:
          return 'vlc-pill--error';
        default:
          return '';
      }
    }
    return '';
  }

  get accessLevelLabel() {
    if (this.accessLevel) {
      return this.accessLevel.label;
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
  async cancelChanges() {
    this.accessLevel = await this.args.piece.accessLevel;
    this.isEditing = false;
  }

  @action
  chooseAccessLevel(accessLevel) {
    this.accessLevel = accessLevel;
  }

  @task
  *toggleAndSaveConfidentiality() {
    // TODO what with overwriting other properties with old data?
    this.confidential = !this.confidential;
    yield this.args.piece.save();
  }

  @task
  *saveAccessLevel() {
    // TODO what with overwriting other properties with old data?
    this.args.piece.set('accessLevel', this.accessLevel);
    yield this.args.piece.save();
    this.isEditing = false;
  }
}
