import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  formatter: inject(),

  actions: {
    createSingleNewsLetter() {
      this.set('isLoading', true);
      const {
        title, subtitle, date, docDate, selectedMeeting,
      } = this;
      const newsletterInfo = this.store.createRecord('newsletter-info', {
        meeting: selectedMeeting,
        title,
        subtitle,
        mandateeProposal: null,
        publicationDate: this.formatter.formatDate(date),
        publicationDocDate: this.formatter.formatDate(docDate),
      });
      newsletterInfo.save().then(() => {
        this.set('isLoading', false);
        this.close();
      });
    },

    close() {
      const {
        selectedMeeting,
      } = this;
      selectedMeeting.rollbackAttributes();
      this.close();
    },

    selectDate(date) {
      this.set('date', this.formatter.formatDate(date));
    },

    selectDocDate(date) {
      this.set('docDate', date);
    },
  },
});
