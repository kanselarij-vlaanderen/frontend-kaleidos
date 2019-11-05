import Component from '@ember/component';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import DS from 'ember-data';
export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-u-spacer-extended-bottom-l'],

  agendaId: computed('item', 'shouldShowDetails', function() {
    const { item } = this;
    if (item.get('title')) {
      const values = item.get('title').split('/');
      return values.get('lastObject');
    }
  }),

  meetingId: computed('item', 'shouldShowDetails', function() {
    const { item } = this;
    if (item.get('title')) {
      const values = item.get('title').split('/');
      return values.get('firstObject');
    }
  }),

  isAgendaItem: computed('item.modelName', function() {
    return 'agendaitem' == this.get('item.modelName');
  }),

  subcaseName: computed('item.{subcaseName,subcase.subcaseName}', async function() {
    const item = await this.get('item');
    const subcase = await this.get('item.subcase');

    if(!subcase) {
      return item.get('subcaseName');
    }

    const subcaseName = await subcase.get('subcaseName');
    if(!subcaseName) {
      return;
    }
    return subcaseName;
  }),

  pillClass: computed('subcaseName','item.{subcase.approved,approved}', async function() {
    let baseClass= "vl-pill vl-u-text--capitalize";
    if(!await this.subcaseName) {
      return baseClass;
    }
    const approved = await this.get('item.subcase.approved');
    const itemApproved = await this.get('item.approved');
    if(approved || itemApproved){
      return baseClass + " vl-pill--success";
    }
    return baseClass;
  }),

  confidential: computed('item.{subcase.confidential,confidential}', function() {
    const { isAgendaItem, item } = this;
    if (isAgendaItem) {
      return DS.PromiseObject.create({
        promise: item.get('subcase').then((subcase) => {
          return subcase.get('confidential');
        }),
      });
    } else {
      return item.get('confidential');
    }
  }),

  accessLevel: computed('item', 'item.subcase', function() {
    const { isAgendaItem, item } = this;
    if (isAgendaItem) {
      return DS.PromiseObject.create({
        promise: item.get('subcase').then((subcase) => {
          return subcase.get('accessLevel');
        }),
      });
    } else {
      return DS.PromiseObject.create({
        promise: item.get('accessLevel'),
      });
    }
  }),

  case: computed('item', function() {
    const item = this.get('item');
    const caze = item.get('case');
    if (caze) {
      return caze;
    }
    return item.get('subcase.case');
  }),

  actions: {
    toggleIsEditing() {
      this.toggleIsEditing();
    },
  },
});
