import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
  title: null,
  shortTitle: null,
  confidential: false,
  store: inject(),

  async createCase() {
    const newDate = moment().utc().toDate();
    const { title, shortTitle, confidential } = this;
    const caze = this.store.createRecord('case',
      {
        title, shortTitle, confidential,
        isArchived: false,
        created: newDate,
      });
    await caze.save();
    this.set('isLoading', false);
    return this.close(caze);
  },

  actions: {
    async createCase($event) {
      this.set('isLoading', true);
      $event.preventDefault();
      await this.createCase();
    },

    close() {
      this.close();
    }
  }
});
