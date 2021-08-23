// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  classNames: ['auk-u-mb-8'],
  selectedMeeting: null,

  items: computed('meetings', 'nearestMeeting.firstObject', 'type', function() {
    if (this.type === 'future') {
      const nearestMeeting = this.get('nearestMeeting.firstObject');
      if (!nearestMeeting) {
        return this.meetings;
      }
      return this.meetings.filter((meeting) => meeting.get('id') !== nearestMeeting.get('id'));
    }
    return this.meetings;
  }),

  hasActiveAgendas: computed('meetings', async function() {
    const meetings = await this.get('meetings');
    if (meetings && meetings.length > 0) {
      return true;
    }
    return false;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    selectAgenda(meeting) {
      this.selectAgenda(meeting);
    },
  },
});
