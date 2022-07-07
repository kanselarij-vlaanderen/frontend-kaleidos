// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';
import * as AgendaPublicationUtils from 'frontend-kaleidos/utils/agenda-publication';

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

    const internalDocumentPublicationActivity = await meeting.internalDocumentPublicationActivity;
    const internalDocumentPublicationTime = AgendaPublicationUtils.getMostCertainPublicationTime(internalDocumentPublicationActivity);
    const themisPublicationActivities = await meeting.themisPublicationActivities.then(a => a.toArray());
    const themisPublicationTime = AgendaPublicationUtils.getFinalMostCertainPublicationTime(themisPublicationActivities, [AgendaPublicationUtils.THEMIS_PUBLICATION_SCOPES.NEWSITEMS]);
    this.set('internalDocumentPublicationTime', internalDocumentPublicationTime);
    this.set('themisPublicationTime', themisPublicationTime);

    const newsletter = await meeting.get('newsletter');
    if (!newsletter && this.currentSession.isEditor) {
      await this.newsletterService.createNewsItemForMeeting(meeting);
    }
  },

  formatPublicationTime(date) {
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
