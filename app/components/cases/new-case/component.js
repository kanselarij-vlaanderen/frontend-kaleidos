import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  title: null,
  shortTitle: null,
  confidential: false,
  store: inject(),

  createCase(newDate) {
    const { title, shortTitle, type, selectedPolicyLevel, selectedMeeting, submitter, confidential } = this;

    return this.store.createRecord('case',
      {
        title, shortTitle, submitter, type, confidential,
        isArchived: false,
        created: newDate,
        policyLevel: selectedPolicyLevel,
        relatedMeeting: selectedMeeting
      });
  },

  actions: {
    async createCase($event) {
      $event.preventDefault();
      const newDate = new Date();
      const caze = this.createCase(newDate);

      caze.save().then((newCase) => {
        this.close(newCase);
      });
    },

    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },

    policyLevelChanged(id) {
      const policyLevel = this.store.peekRecord('policy-level', id);
      this.set('selectedPolicyLevel', policyLevel);
    },

    typeChanged(id) {
      const type = this.store.peekRecord('case-type', id);
      this.set('type', type);
    },

    statusChange(status) {
      this.set('status', status);
    },

    submitterChanged(submitter) {
      this.set('submitter', submitter);
    },

    selectedMeetingChanged(meeting) {
      this.set('selectedMeeting', meeting);
    },

    close() {
      this.close();
    }
  }
});
