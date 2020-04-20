import Component from '@ember/component';
import EmberObject from '@ember/object';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

export default Component.extend({
  confidential: false,
  editing: false,
  intl: service(),
  session: service('current-session'),
  classNameBindings: [':vl-u-display-flex', ':vl-u-flex-align-center'],

  accessLevel: computed('item.accessLevel', function () {
    const accessLevel = this.get('item.accessLevel');
    if (!accessLevel) {
      return null;
    }
    return DS.PromiseObject.create({
      promise: accessLevel.then((access) => {
        return access;
      })
    })
  }),
  originalAccessLevel: computed('item.accessLevel', function () {
    const accessLevel = this.get('item.accessLevel');
    if (!accessLevel) {
      return null;
    }
    return DS.PromiseObject.create({
      promise: accessLevel.then((access) => {
        return access;
      })
    })
  }),

  loading: computed.alias('accessLevel.isPending'),

  accessLevelClass: computed('accessLevelId', function () {
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
  }),

  accessLevelId: computed('accessLevel.id', function () {
    return (this.get('accessLevel') || EmberObject.create()).get('id');
  }),

  accessLevelLabel: computed('accessLevel.label', function () {
    return (this.get('accessLevel') || EmberObject.create()).get('label') || this.intl.t('no-accessLevel');
  }),

  actions: {
    toggleEdit() {
      if (this.get('session.isEditor')) {
        this.toggleProperty('editing');
      }
    },
    cancelChanges() {
      this.set('accessLevel', this.originalAccessLevel);
      this.set('editing', false);
    },
    chooseAccessLevel(accessLevel) {
      this.set('accessLevel', accessLevel);
    },
    toggleConfidential: function () {
      if (!this.get('session.isEditor')) {
        return;
      }

      this.item.toggleConfidential();
    },
    save: async function () {
      this.set('loading', true);
      await this.item.storeAccessLevel(this.get('accessLevel'));
      this.set('loading', false);
      this.set('editing', false);
    }
  }
});
