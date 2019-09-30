import Component from '@ember/component';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject as service } from '@ember/service';

export default Component.extend(isAuthenticatedMixin, {
  accessLevel: null,
  originalAccessLevel: null,
  item: null,
  confidential: false,
  loading: true,
  editing: false,
  intl: service(),
  classNameBindings: [':vl-u-display-flex'],

  didInsertElement: function(){
    this._super(...arguments);
    if(!this.item){
      return;
    }
    this.set('loading', true);

    this.get('item.accessLevel').then((accessLevel) => {
      this.set('accessLevel', accessLevel);
      this.set('originalAccessLevel', accessLevel);
      this.set('loading', false);
    });

  },

  accessLevelClass: computed('accessLevelId', function(){
    switch(this.accessLevelId){
      case "6ca49d86-d40f-46c9-bde3-a322aa7e5c8e":
        return 'vlc-pill--success';
      case "abe4c18d-13a9-45f0-8cdd-c493eabbbe29":
        return 'vlc-pill--warning';
      case "d335f7e3-aefd-4f93-81a2-1629c2edafa3":
        return 'vlc-pill--error';
      default:
        return '';
    }
  }),

  accessLevelId: computed('accessLevel.id', function(){
    return (this.get('accessLevel') || {}).id;
  }),

  accessLevelLabel: computed('accessLevel.label', function(){
    return (this.get('accessLevel') || {}).label || this.intl.t('no-accessLevel');
  }),

  actions: {
    toggleEdit() {
      if (this.get('isEditor')) {
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
    save: async function(){
      this.set('loading', true);
      await this.item.storeAccessLevel(this.get('accessLevel'));
      this.set('loading', false);
      this.set('editing', false);
    }
  }
});
