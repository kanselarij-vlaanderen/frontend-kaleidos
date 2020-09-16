import Component from '@ember/component';
import EmberObject, {
  action, computed
} from '@ember/object';

import { inject as service } from '@ember/service';
import DS from 'ember-data';
import CONFIG from 'fe-redpencil/utils/config';

export default class AccessLevelPill extends Component {
  confidential = false;

  editing = false;

  @service() intl;

  @service('current-session') session;

  classNameBindings = [':vl-u-display-flex', ':vl-u-flex-align-center'];

  loading = false;
  lastDocumentVersion = null;

  @computed('lastDocumentVersion.accessLevel')
  get accessLevel() {
    const accessLevel = this.get('lastDocumentVersion.accessLevel');

    if (!accessLevel) {
      return null;
    }

    return DS.PromiseObject.create({
      promise: accessLevel.then((access) => access),
    });
  }

  @computed('lastDocumentVersion.accessLevel')
  get originalAccessLevel() {
    const accessLevel = this.get('lastDocumentVersion.accessLevel');

    if (!accessLevel) {
      return null;
    }

    return DS.PromiseObject.create({
      promise: accessLevel.then((access) => access),
    });
  }

  @computed('accessLevelId')
  get accessLevelClass() {
    switch (this.accessLevelId) {
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

  @computed('accessLevel.id')
  get accessLevelId() {
    return (this.get('accessLevel') || EmberObject.create()).get('id');
  }

  @computed('accessLevel.label')
  get accessLevelLabel() {
    return (this.get('accessLevel') || EmberObject.create()).get('label') || this.intl.t('no-accessLevel');
  }

  @action
  toggleEdit() {
    if (this.get('session.isEditor')) {
      this.toggleProperty('editing');
    }
  }

  @action
  cancelChanges() {
    this.set('accessLevel', this.originalAccessLevel);
    this.set('editing', false);
  }

  @action
  chooseAccessLevel(accessLevel) {
    this.set('accessLevel', accessLevel);
  }

  @action
  toggleConfidential() {
    if (!this.get('session.isEditor')) {
      return;
    }

    this.lastDocumentVersion.set('confidential', !this.lastDocumentVersion.get('confidential'));
    this.lastDocumentVersion.save();
  }

  @action
  save() {
    if (this.get('accessLevel')) {
      this.set('loading', true);
      this.lastDocumentVersion.set('accessLevel', this.accessLevel);
      this.lastDocumentVersion.save();
      this.set('loading', false);
      this.set('editing', false);
    }
  }
}
