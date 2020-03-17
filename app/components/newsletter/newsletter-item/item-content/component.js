import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-typography'],
  classNameBindings: ['isFlandersArt:vl-typography--definite'],
  newsletterService: inject(),
  isShowingVersions: false,

  isFlandersArt: computed('allowEditing', function () {
    return !this.allowEditing;
  }),

  numberToShow: computed('agendaitem.{number,showAsRemark}', 'itemIndex', 'definite', function () {
    if (this.agendaitem.showAsRemark && this.definite === 'true') {
      return '';
    }
    if (this.itemIndex) {
      return this.itemIndex + '.';
    } else {
      return this.agendaitem.get('number') + '.';
    }
  }),

  actions: {
    showDocuments() {
      this.toggleProperty('isShowingVersions');
    },
    async toggleIsEditing() {
      const { agendaitem } = this;
      const subcase = await agendaitem.get('subcase');
      const newsletter = await subcase.get('newsletterInfo');
      if (!newsletter) {
        await this.newsletterService.createNewsItemForSubcase(subcase, agendaitem);
      } else {
        this.toggleProperty('isEditing');
      }
    },
  },
});
