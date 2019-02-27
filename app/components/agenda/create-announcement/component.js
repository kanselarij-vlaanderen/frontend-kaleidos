import Component from '@ember/component';
import { inject } from '@ember/service';
import { notifyPropertyChange } from '@ember/object';

export default Component.extend({
  classNames: ["vl-layout-agenda__detail"],
  store: inject(),

  actions : {
    async createAnnouncement (){
      const { title, text } = this;
      const agenda = await this.get('currentAgenda');
      const announcement = this.store.createRecord('announcement', { title, text, created: new Date(), modified: new Date(), agenda });
      await announcement.save();
      notifyPropertyChange(agenda, 'announcements');
    }
  }
});
