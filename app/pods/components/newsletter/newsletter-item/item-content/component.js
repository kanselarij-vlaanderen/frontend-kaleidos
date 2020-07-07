import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-typography'],
  classNameBindings: ['isFlandersArt:vl-typography--definite'],
  newsletterService: inject(),
  currentSession: inject(),
  isShowingVersions: false,
  allowEditing: false,
  definite: false,
  itemIndex: 0,
  isEditing: false,
  agendaitem: null,
  newsletterInfo: null,

  isFlandersArt: computed('allowEditing', function () {
    return !this.allowEditing;
  }),

  numberToShow: computed('agendaitem.{number,showAsRemark}', 'itemIndex', 'definite', function () {
    if (this.agendaitem.showAsRemark && this.definite === 'true') {
      return '';
    }
    if (this.itemIndex) {
      return `${this.itemIndex}.`;
    }
    return `${this.agendaitem.get('number')}.`;
  }),

  actions: {
    showDocuments() {
      this.toggleProperty('isShowingVersions');
    },
    async toggleIsEditing() {
      const subcase = await this.newsletterInfo.get('subcase');
      if (!this.newsletterInfo) {
        await this.newsletterService.createNewsItemForSubcase(subcase, this.agendaitem);
      } else {
        this.toggleProperty('isEditing');
      }
    },
  },
});
