// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-mt-5', 'auk-u-mb-10'],
  intl: inject(),
  currentSession: inject(),
  newsletterService: inject(),
  internalDocumentPublicationTime: null,
  themisPublicationTime: null,

  async init() {
    this._super(...arguments);
    const meeting = await this.get('meeting');
    const newsletter = await meeting.get('newsletter');
    if (!newsletter && this.currentSession.isEditor) {
      await this.newsletterService.createNewsItemForMeeting(meeting);
    }
    const internalDocumentPublicationActivity = await meeting.internalDocumentPublicationActivity;
    const internalDocumentPublicationTime = internalDocumentPublicationActivity?.plannedPublicationTime ?? internalDocumentPublicationActivity?.unconfirmedPublicationTime;
    this.set('internalDocumentPublicationTime', internalDocumentPublicationTime);
    const themisPublicationActivities = await meeting.themisPublicationActivities.then(a => a.toArray());
    const themisPublicationActivity = themisPublicationActivities.sortBy('plannedPublicationTime').firstObject;
    const themisPublicationTime = themisPublicationActivity?.plannedPublicationTime ?? themisPublicationActivity?.unconfirmedPublicationTime;
    this.set('themisPublicationTime', themisPublicationTime);
  },

  formatPublicationTime(date) {
    console.log(date)
    let formattedStart;
    if (date != null) {
      formattedStart = moment(date).format('DD MMMM YYYY - HH:ss');
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
