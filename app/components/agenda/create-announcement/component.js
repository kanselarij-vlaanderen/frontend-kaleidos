import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ["vl-layout-agenda__detail"],
  store: inject(),

  actions : {
    async createAnnouncement (){
      const { title, text } = this;
      const agenda = this.get('currentAgenda');
      const date = new Date();
      const announcement = this.store.createRecord('announcement', { title, text, created: date, modified: date, agenda });
      await announcement.save();
      agenda.notifyPropertyChange('announcements');
    }
  }
});
