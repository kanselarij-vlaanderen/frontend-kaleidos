import Component from '@ember/component';
import EmberObject, {
  action, computed
} from '@ember/object';

import { inject as service } from '@ember/service';
import DS from 'ember-data';

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
      case '6ca49d86-d40f-46c9-bde3-a322aa7e5c8e':
        return 'vlc-pill--success';
      case 'abe4c18d-13a9-45f0-8cdd-c493eabbbe29':
        return 'vlc-pill--warning';
      case 'd335f7e3-aefd-4f93-81a2-1629c2edafa3':
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

    this.lastDocumentVersion.toggleConfidential();
  }

  @action
  async save() {
    if (this.get('accessLevel')) {
      this.set('loading', true);
      await this.get('lastDocumentVersion').storeAccessLevel(this.get('accessLevel'));
      this.set('loading', false);
      this.set('editing', false);
    }
  }
}
