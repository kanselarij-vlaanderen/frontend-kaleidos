// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-mt-5', 'auk-u-mb-10'],
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

  editTitle: computed('meeting.plannedStart', function() {
    const date = this.get('meeting.plannedStart');
    return `${this.get('intl').t('newsletter-of')} ${moment(date).format('dddd DD.MM.YYYY')}`;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
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
