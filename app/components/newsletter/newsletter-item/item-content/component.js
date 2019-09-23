import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vl-typography'],
  classNameBindings: ['isFlandersArt:vl-typography--definite'],
  store: inject(),
  isShowingVersions: false,

  isFlandersArt: computed('allowEditing', function() {
    return !this.allowEditing;
  }),

  numberToShow: computed('agendaitem.number', 'index', function() {
    if (this.index) {
      return this.index;
    } else {
      return this.agendaitem.get('number');
    }
  }),

  async addNewsItem(subcase, agendaitem) {
    const news = this.store.createRecord('newsletter-info', {
      subcase: subcase,
      created: moment()
        .utc()
        .toDate(),
      title: await agendaitem.get('shortTitle'),
      subtitle: await agendaitem.get('title'),
    });
    await news.save();
  },

  actions: {
    showDocuments() {
      this.toggleProperty('isShowingVersions');
    },
    async toggleIsEditing() {
      const { agendaitem } = this;
      const subcase = await agendaitem.get('subcase');
      const newsletter = await subcase.get('newsletterInfo');
      if (!newsletter) {
        await this.addNewsItem(subcase, agendaitem);
      } else {
        if (!newsletter.get('title')) {
          newsletter.set('title', agendaitem.get('shortTitle'));
          await newsletter.save();
        }
      }

      this.toggleProperty('isEditing');
    },
  },
});
