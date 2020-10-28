import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-bottom-l'],
  isEditing: false,
  intl: inject(),
  currentSession: inject(),
  newsletterService: inject(),

  allowEditing: false,

  async init() {
    this._super(...arguments);
    const meeting = await this.get('meeting');
    const newsletter = await meeting.get('newsletter');
    if (!newsletter && this.currentSession.isEditor) {
      await this.newsletterService.createNewsItemForMeeting(meeting);
    }
  },

  editTitle: computed('meeting', function() {
    const date = this.get('meeting.plannedStart');
    return `${this.get('intl').t('newsletter-of')} ${moment(date).format('dddd DD-MM-YYYY')}`;
  }),

  actions: {
    async toggleIsEditing() {
      const meeting = await this.get('meeting');
      const newsletter = await meeting.get('newsletter');
      if (!newsletter && this.currentSession.isEditor) {
        await this.newsletterService.createNewsItemForMeeting(meeting);
      }

      this.toggleProperty('isEditing');
    },
    close() {
      this.toggleProperty('isEditing');
    },
  },
});
