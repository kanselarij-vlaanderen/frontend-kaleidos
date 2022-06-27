// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment'

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-mt-5', 'auk-u-mb-10'],
  intl: inject(),
  currentSession: inject(),
  newsletterService: inject(),

  async init() {
    this._super(...arguments);
    const meeting = await this.get('meeting');
    const newsletter = await meeting.get('newsletter');
    if (!newsletter && this.currentSession.isEditor) {
      await this.newsletterService.createNewsItemForMeeting(meeting);
    }
  },

  formatStart(internalXPublicationActivity) {
    const start = internalXPublicationActivity?.startDate ?? internalXPublicationActivity?.plannedStart;
    let formattedStart;
    if (start != null) {
      formattedStart = moment(start).format('DD MMMM YYYY - HH:ss');
    } else {
      formattedStart = '-';
    }
    return formattedStart;
  },

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    close() {
      this.toggleProperty('isEditing');
    },
  },
});
